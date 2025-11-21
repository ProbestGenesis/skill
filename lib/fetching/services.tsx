export const services = async (userId: string | undefined) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/services`);
  const data = await res.json();
  return data;
};
