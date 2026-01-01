import axios from "axios";

export function handleAxiosError(error: unknown): string {
  let errorMessage = "Une erreur s'est produite";

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (
      responseData?.data?.errors &&
      typeof responseData.data.errors === "object"
    ) {
      const errors = responseData.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey && errors[firstErrorKey]) {
        errorMessage = errors[firstErrorKey];
      }
    } else {
      errorMessage =
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Erreur inconnue du serveur";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
}