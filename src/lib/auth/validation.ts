import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254, "البريد الإلكتروني طويل جدًا.").pipe(z.email("اكتب بريد إلكتروني صحيح."));
const password = z.string().min(12, "كلمة المرور لازم تكون ١٢ حرف على الأقل.").max(128, "كلمة المرور طويلة جدًا.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "كلمة المرور طويلة جدًا؛ استخدم حروف أقل.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "اكتب كلمة المرور.").max(128, "كلمة المرور طويلة جدًا.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "كلمة المرور طويلة جدًا."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسمك من حرفين على الأقل.").max(80, "الاسم طويل جدًا."),
  workspaceName: z.string().trim().min(2, "اسم مساحة العمل لازم يكون حرفين على الأقل.").max(80, "اسم مساحة العمل طويل جدًا."),
  email,
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور مش متطابقتين.",
  path: ["confirmPassword"],
});
