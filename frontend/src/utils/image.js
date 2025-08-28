// frontend/src/utils/image.js

// 절대 URL인지(이미 http/https/data/blob) 판별
const isAbsolute = (s) => /^https?:\/\//i.test(s) || /^data:|^blob:/i.test(s);

/**
 * 주어진 경로/파일명을 '/images/<filename>' 로 정규화
 * - 'dummy/2.jpg'  -> '/images/2.jpg'
 * - 'C:\a\b\1.png' -> '/images/1.png'
 * - 'http://...'   -> 그대로 반환(외부 URL)
 * - null/undefined -> '' (빈 문자열)
 */
export const toImageUrl = (p) => {
  if (!p) return "";
  const s = String(p).trim();
  if (isAbsolute(s)) return s;
  const name = s.split(/[\\/]/).pop(); // 윈도우/리눅스 경로 모두 대응
  return `/images/${name}`;
};

/**
 * image_paths 원본(배열 또는 문자열/널)을
 * '/images/<filename>' 배열로 변환
 */
export const toImageUrls = (paths) => {
  if (!paths) return [];
  const arr = Array.isArray(paths) ? paths : [paths];
  return arr.map(toImageUrl).filter(Boolean);
};

/**
 * 첫 번째 이미지 URL (없으면 placeholder 가능)
 * @param paths 배열 또는 객체({ image_paths }) 모두 허용
 * @param fallback 없을 때 대체 이미지 경로
 */
export const firstImageUrl = (paths, fallback = "") => {
  let raw = paths;
  if (paths && typeof paths === "object" && Array.isArray(paths.image_paths)) {
    raw = paths.image_paths;
  }
  const list = toImageUrls(raw);
  return list[0] || fallback; // 필요하면 '/images/placeholder.jpg'
};

// 기존 코드 호환용 별칭
export const firstImage = firstImageUrl;
