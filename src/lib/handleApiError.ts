export function handleApiError(
  error: any,
  defaultMessage: string = "Something went wrong"
): string {
  if (!error) {
    return defaultMessage;
  }
  //Strapi formated error
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  //Strapi new error
  if (error?.error?.message) {
    return error.error.message;
  }
  //Axios error
  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
}
