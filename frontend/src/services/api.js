import axios from 'axios'
const baseUrl = ''

const check = (answers) => {
  return axios
    .post(`${baseUrl}/check`, answers)
    .then(response => response.data)
}

export default { check }
