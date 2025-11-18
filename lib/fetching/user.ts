

export const userProviderData = async (userId: string | undefined) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/${userId}`);
  const data = await res.json();
  return data;
};

export const fetchSkills = async ({
  providerId,
  userId,
}: {
  providerId: string | undefined;
  userId: string | undefined;
}) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/provider/${providerId}/skills`);
  const data = await res.json();
  console.log(data);
  return data;
};
