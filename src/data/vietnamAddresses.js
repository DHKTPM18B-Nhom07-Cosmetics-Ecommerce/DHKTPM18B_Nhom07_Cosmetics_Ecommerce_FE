// Using sub-vn for complete Vietnamese address data (Provinces, Districts, Wards)
import subVn from 'sub-vn';

// Get all provinces for the dropdown
export const provinces = subVn.getProvinces().map(province => ({
  value: province.code,
  label: province.name,
  code: province.code
}));

// Get districts by province code
export const getDistrictsByProvince = (provinceCode) => {
  if (!provinceCode) return [];
  const districts = subVn.getDistrictsByProvinceCode(provinceCode);
  return districts.map(district => ({
    value: district.code,
    label: district.name,
    code: district.code
  }));
};

// Get wards by district code
export const getWardsByDistrict = (provinceCode, districtCode) => {
  if (!districtCode) return [];
  const wards = subVn.getWardsByDistrictCode(districtCode);
  return wards.map(ward => ({
    value: ward.code,
    label: ward.name,
    code: ward.code
  }));
};


