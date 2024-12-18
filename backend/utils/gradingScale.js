import { GRADE_SYSTEM } from "../constants/grade.js";

export const gradingScale = () => {
  return Math.floor(Math.random() * GRADE_SYSTEM) + 1;
};
