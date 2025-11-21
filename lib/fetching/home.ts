

export const fetchProximityProviders = async ({
  lat,
  long,
  userId,
}: {
  lat: number | undefined;
  long: number | undefined;
  userId?: string;
}) => {
  if (userId) {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/provider/notFar?lat=${lat}&long=${long}`
    );
    const data = await res.json();
    return data;
  } else {
    const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/notFar?lat=${lat}&long=${long}`);
    const data = await res.json();
    return data;
  }
};

export const fetchProximityCustomer = async ({
  lat,
  long,
  userId,
  providerId,
}: {
  lat: number | undefined;
  long: number | undefined;
  userId?: string;
  providerId: string | undefined;
}) => {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/provider/${providerId}/nearCustomers?lat=${lat}&long=${long}`
  );
  const data = await res.json();
  return data;
};

export const yourLastPost = async (userId: string | undefined) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/post`);
  const data = await res.json();
  return data;
};

export const posts = async () => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/posts`);
  const data = await res.json();
  return data;
};

export const fetchYourAllPosts = async ({
  userId,
  page,
}: {
  userId: string | undefined;
  page: number;
}) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/posts?page=${page ? page : 1}}`);
  const data = await res.json();
  return {
    data: data,
    hasMore: data.length === 50,
  };
};

export const fetchYourRecentProviders = async ({ userId }: { userId: string | undefined }) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${userId}/provider/yourProviders`);
  const data = await res.json();
  return data;
};
