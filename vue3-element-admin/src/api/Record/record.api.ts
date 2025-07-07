import request from '@/utils/request';

export const RecordAPI = {
  GetRecord(data: any, bizId: string|undefined) {
    return request({
      url: `/api/app/operation-log/logs/${bizId}`,
      method: 'get',
      params:data,
    });
  },
}
export default RecordAPI;