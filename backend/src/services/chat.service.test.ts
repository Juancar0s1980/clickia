import { conversationRepository } from "../repositories/conversation.repository";
import { diagnosticRepository } from "../repositories/diagnostic.repository";
import { messageRepository } from "../repositories/message.repository";
import { chatService } from "./chat.service";
import { generateAiReply } from "./ai/aiReply.service";
import { knowledgeBaseService } from "./knowledgeBase.service";
import { networkStatusService } from "./networkStatus.service";
import { planService } from "./plan.service";
import { topicGuardService } from "./topicGuard.service";
import { weatherService } from "./weather.service";

jest.mock("../repositories/conversation.repository");
jest.mock("../repositories/diagnostic.repository");
jest.mock("../repositories/message.repository");
jest.mock("./ai/aiReply.service");
jest.mock("./knowledgeBase.service");
jest.mock("./networkStatus.service");
jest.mock("./plan.service");
jest.mock("./topicGuard.service");
jest.mock("./weather.service");

const mockedConversationCreate = conversationRepository.create as jest.MockedFunction<typeof conversationRepository.create>;
const mockedMessageCreate = messageRepository.create as jest.MockedFunction<typeof messageRepository.create>;
const mockedListByConversation = messageRepository.listByConversation as jest.MockedFunction<
  typeof messageRepository.listByConversation
>;
const mockedFindRelevantProblem = knowledgeBaseService.findRelevantProblem as jest.MockedFunction<
  typeof knowledgeBaseService.findRelevantProblem
>;
const mockedGetStatus = networkStatusService.getStatus as jest.MockedFunction<typeof networkStatusService.getStatus>;
const mockedFindRelevantPlans = planService.findRelevantPlans as jest.MockedFunction<typeof planService.findRelevantPlans>;
const mockedIsOnTopic = topicGuardService.isOnTopic as jest.MockedFunction<typeof topicGuardService.isOnTopic>;
const mockedGetCurrentWeather = weatherService.getCurrent as jest.MockedFunction<typeof weatherService.getCurrent>;
const mockedGenerateAiReply = generateAiReply as jest.MockedFunction<typeof generateAiReply>;

const NETWORK_STATUS = { zone: "Centro", service: "internet", status: "operativo" as const, estimated_time: null };

beforeEach(() => {
  mockedConversationCreate.mockResolvedValue({
    id: "conv-1",
    user_id: "user-1",
    estado: "abierta",
    fecha_inicio: new Date(),
    updated_at: new Date(),
  });
  mockedMessageCreate.mockResolvedValue({
    id: "msg-1",
    conversation_id: "conv-1",
    sender: "ai",
    message: "respuesta",
    timestamp: new Date(),
  });
  mockedListByConversation.mockResolvedValue([]);
  mockedGetStatus.mockResolvedValue(NETWORK_STATUS);
  mockedFindRelevantPlans.mockResolvedValue(null);
  mockedIsOnTopic.mockReturnValue(true);
  mockedGetCurrentWeather.mockResolvedValue(null);
  mockedGenerateAiReply.mockResolvedValue({ text: "respuesta", source: "fallback_template" });
  (diagnosticRepository.create as jest.Mock).mockResolvedValue({});
});

describe("chatService.sendMessage — cuándo se consulta el clima", () => {
  it("consulta el clima cuando hay un problema técnico identificado", async () => {
    mockedFindRelevantProblem.mockResolvedValue({
      problem: { id: "p1", nombre: "WiFi lento", categoria: "rendimiento", descripcion: "d", nivel: "medio" },
      solutions: [],
      score: 1,
    });

    await chatService.sendMessage({ userId: "user-1", message: "mi wifi está lento" });

    expect(mockedGetCurrentWeather).toHaveBeenCalledWith("Centro");
  });

  it("NO consulta el clima para temas de cuenta/comerciales (ej. 'Mejorar mi plan')", async () => {
    mockedFindRelevantProblem.mockResolvedValue({
      problem: { id: "p2", nombre: "Mejorar mi plan", categoria: "cuenta", descripcion: "d", nivel: "bajo" },
      solutions: [],
      score: 1,
    });

    await chatService.sendMessage({ userId: "user-1", message: "quiero mejorar mi plan" });

    expect(mockedGetCurrentWeather).not.toHaveBeenCalled();
  });

  it("NO consulta el clima cuando no hay ningún problema identificado", async () => {
    mockedFindRelevantProblem.mockResolvedValue(null);

    await chatService.sendMessage({ userId: "user-1", message: "hola" });

    expect(mockedGetCurrentWeather).not.toHaveBeenCalled();
  });

  it("NO consulta el clima (ni nada más) cuando el mensaje está fuera de tema", async () => {
    mockedIsOnTopic.mockReturnValue(false);

    await chatService.sendMessage({ userId: "user-1", message: "cuéntame un chiste" });

    expect(mockedGetCurrentWeather).not.toHaveBeenCalled();
    expect(mockedFindRelevantProblem).not.toHaveBeenCalled();
  });
});
