import { useState } from "react";
import { useTranslation } from "react-i18next";
import enImgUrl from "../assets/en.png";
import heImgUrl from "../assets/he.png";

export const LanguageToggle = ({
  changeLanguage,
}: {
  changeLanguage: (lng: string) => void;
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = i18n.dir() === "rtl";

  const languages = [
    {
      code: "en",
      name: "English",
      flagUrl: enImgUrl,
    },
    {
      code: "he",
      name: "עברית",
      flagUrl: heImgUrl,
    },
  ];

  return (
    <div className="relative text-left">
      <div dir={i18n.dir()}>
        <button
          aria-label="Language options"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full rounded-lg border border-border bg-background px-2 py-2 text-sm font-medium text-foreground shadow-sm  hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
        >
          <span className={`w-6 h-5 flex items-center justify-center`}>
            <img
              src={
                languages.find((lang) => lang.code === i18n.language)?.flagUrl
              }
              alt="Flag"
              className="w-6 h-5 object-cover shadow-sm"
            />
          </span>
          <svg
            className={
              "h-5 w-5 text-muted-foreground" + (isRtl ? " mr-2" : " ml-2")
            }
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 rounded-lg shadow-lg bg-card ring-1 ring-border transition-all min-w-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {languages.map((lang) => (
              <button
                aria-label="Language option"
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`${
                  i18n.language === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted hover:text-muted-foreground"
                } flex items-center px-4 py-2 text-sm w-full rounded-md transition-all`}
                role="menuitem"
              >
                <span className={`w-6 h-5`}>
                  <img
                    src={lang.flagUrl}
                    alt="Flag"
                    className="w-6 h-5 object-cover shadow-sm"
                  />
                </span>
                <span className={`${isRtl ? "mx-1" : "mx-1"}`}>
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
