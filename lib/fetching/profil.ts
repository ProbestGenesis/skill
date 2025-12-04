
export const profildata = async (providerId: string | string[]) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/${providerId}`);
  const data = await res.json();
  return data;
};
