import API from './index';

export const fetchBannedKeywords = async () => {
  const res = await API.get('/banned_keywords');
  return res.data.map((item: any) => item.word?.toLowerCase());
};
