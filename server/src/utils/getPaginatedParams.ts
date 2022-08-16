export const getPaginatedParams = (
  pageParam?: number,
  limitParam?: number,
): { skip: number; take: number; page: number } => {
  const page = pageParam ? Number(pageParam) : 1;
  const take = limitParam ? Number(limitParam) : 4;
  const skip = (page - 1) * take;

  return {
    page,
    take,
    skip,
  };
};
