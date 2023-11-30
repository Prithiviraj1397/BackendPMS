export const setHttpPlugin = {
    async requestDidStart() {
        return {
            async willSendResponse({ response }: any) {
                const error = response.errors?.[0];
                if (error && error.extensions?.status) {
                    response.http.status = error.extensions.status;
                    delete error.extensions.status
                }
            },
        };
    },
};
