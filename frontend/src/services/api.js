import axios from 'axios'
const baseUrl = 'http://localhost:3001'

const test = (answers) => {
  return axios
    .post(`${baseUrl}/testendpoint`, answers)
    .then(response => response.data)
}

export default { test }
