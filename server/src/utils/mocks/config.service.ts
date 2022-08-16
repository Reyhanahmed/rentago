const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'ACCESS_TOKEN_EXPIRATION_TIME':
        return '3600';

      case 'ACCESS_TOKEN_SECRET':
        return 'access_token_secret';

      case 'REFRESH_TOKEN_EXPIRATION_TIME':
        return '7200';

      case 'REFRESH_TOKEN_SECRET':
        return 'refresh_token_secret';
    }
  },
};

export default mockedConfigService;
