/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is eithehr 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const path = type === 'password' ? 'updateMyPassword' : 'updateMe';
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${path}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
