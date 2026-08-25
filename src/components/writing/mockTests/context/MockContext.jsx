import { createContext, useContext } from 'react';
import { getWritingMock } from '../data/mocks';

export const MockContext = createContext(getWritingMock());

export function useWritingMock() {
  return useContext(MockContext);
}
