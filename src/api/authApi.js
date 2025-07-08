import axiosClient from './axiosClient';

export const login = (data) => axiosClient.post('/login', data);
export const register = (data) => axiosClient.post('/register', data);

export const resetPassword = async (username, newPass) => {
    // tìm user dựa trên username
    const { data } = await axiosClient.get(`/users?username=${username}`);
    if (!data.length) throw new Error('Username không tồn tại!');
    const id = data[0].id;

    // PATCH để đổi mật khẩu
    return axiosClient.patch(`/users/${id}`, { password: newPass });
};
