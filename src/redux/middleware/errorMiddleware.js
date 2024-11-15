export const errorMiddleware = (store) => (next) => async (action) => {
  try {
    return await next(action);
  } catch (error) {
    // Логируем ошибку
    console.error("Action error:", {
      type: action.type,
      error: error.message,
      stack: error.stack,
    });

    // Если это ошибка авторизации
    if (error.response?.status === 401) {
      store.dispatch({ type: "auth/logout" });
    }

    // Общая обработка ошибок
    store.dispatch({
      type: "error/set",
      payload: {
        message: error.message,
        actionType: action.type,
        timestamp: Date.now(),
      },
    });

    throw error;
  }
};
