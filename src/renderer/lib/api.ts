export const pingMain = async (): Promise<string> => {
  const response = await window.api.ping();
  return response.message;
};
