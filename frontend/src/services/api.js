import axios from 'axios'
const baseUrl = 'http://localhost:3001'

const check = (answers) => {
  return axios
    .post(`${baseUrl}/check`, answers)
    .then(response => response.data)
}

export default { check }
