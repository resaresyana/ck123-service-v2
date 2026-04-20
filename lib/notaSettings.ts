export interface NotaSettings {
  showLogo: boolean;
  paperSize: "58mm" | "76mm" | "A4";
}

export const getNotaSettings = (): NotaSettings => {
  try {
    return {
      showLogo: JSON.parse(localStorage.getItem("ck123_nota_show_logo") || "true"),
      paperSize: (localStorage.getItem("ck123_nota_paper") || "58mm") as NotaSettings["paperSize"],
    };
  } catch {
    return { showLogo: true, paperSize: "58mm" };
  }
};
