import { t } from "i18next";

const Unauthorized = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-500">{t("unauthorized")}</h1>
    </div>
  );
};

export default Unauthorized;
