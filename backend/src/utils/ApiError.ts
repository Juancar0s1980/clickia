export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "No autorizado"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Prohibido"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso no encontrado"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}
