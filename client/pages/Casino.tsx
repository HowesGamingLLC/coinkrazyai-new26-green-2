import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slots from './Slots';

// Casino page is an alias to Slots page since we're using the slot games system
const Casino = () => {
  return <Slots />;
};

export default Casino;
