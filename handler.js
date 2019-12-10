import {
  createCar as createC,
  listCar as listC,
  getCar as getC,
  updateCar as updateC,
  deleteCar as deleteC,
} from './app/controllers/car';

export const createCar = createC;
export const listCar = listC;
export const getCar = getC;
export const updateCar = updateC;
export const deleteCar = deleteC;
export default {
  createCar,
  listCar,
  getCar,
  updateCar,
  deleteCar,
};
