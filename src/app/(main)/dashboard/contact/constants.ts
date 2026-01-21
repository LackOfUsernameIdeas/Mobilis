export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
  slideIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
  },
} as const;

export const CONTACT_INFO = {
  email: "support@mobilis.bg",
  phone: "+359 2 XXX XXXX",
  workingHours: "Понеделник - Петък, 9:00 - 18:00",
};

export const PAGE_TEXT = {
  header: {
    title: "Свържете се с нас",
    subtitle: "Имате въпроси или предложения? Ще се радваме да чуем от вас!",
  },
  info: {
    description: "Моля, попълнете формата по-долу и ние ще се свържем с вас възможно най-скоро.",
  },
  form: {
    title: "Изпратете ни съобщение",
    fields: {
      name: {
        label: "Име",
        placeholder: "Вашето име",
      },
      email: {
        label: "Имейл адрес",
        placeholder: "example@email.com",
      },
      subject: {
        label: "Тема",
        placeholder: "Относно какво е вашето запитване?",
      },
      message: {
        label: "Съобщение",
        placeholder: "Напишете вашето съобщение тук...",
      },
    },
    submitButton: "Изпрати съобщение",
    submitSuccess: "Изпратено успешно!",
  },
  success: {
    message: "Благодарим ви за съобщението! Ще се свържем с вас скоро.",
  },
  validation: {
    required: "Това поле е задължително",
    invalidEmail: "Моля, въведете валиден имейл адрес",
  },
};
