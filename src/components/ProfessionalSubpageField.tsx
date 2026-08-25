type ProfessionalSubpageFieldProps = {
  variant: "cv" | "portfolio" | "contact";
};

export function ProfessionalSubpageField({ variant }: ProfessionalSubpageFieldProps) {
  return (
    <div
      aria-hidden="true"
      className={`professional-subpage-field professional-subpage-field--${variant}`}
    >
      <svg
        className="professional-subpage-field__drawing"
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 700"
      >
        {variant === "cv" ? <CvDrawing /> : null}
        {variant === "portfolio" ? <PortfolioDrawing /> : null}
        {variant === "contact" ? <ContactDrawing /> : null}
      </svg>
      <span className="professional-subpage-field__datum" />
      <span className="professional-subpage-field__beacon" />
    </div>
  );
}

function CvDrawing() {
  return (
    <>
      <g className="professional-subpage-field__structure">
        <path d="M238 104H1194V590H238Z" />
        <path d="M238 190H1194M238 288H1194M238 386H1194M238 484H1194" />
        <path d="M438 104V590M1036 104V590" />
        <path d="M486 234H840M486 332H922M486 430H778M486 528H886" />
        <path d="M1088 232H1148M1088 330H1148M1088 428H1148M1088 526H1148" />
      </g>
      <g className="professional-subpage-field__dimensions">
        <path d="M194 104V590M181 104H208M181 590H208" />
        <path d="M238 632H1194M238 619V645M1194 619V645" />
        <path d="M438 72H1036M438 60V84M1036 60V84" />
      </g>
      <path
        className="professional-subpage-field__route"
        d="M72 550C198 550 254 504 338 504S468 386 548 386 660 288 744 288 874 190 956 190 1086 126 1328 126"
      />
      <g className="professional-subpage-field__nodes">
        <circle cx="338" cy="504" r="5" />
        <circle cx="548" cy="386" r="5" />
        <circle cx="744" cy="288" r="5" />
        <circle cx="956" cy="190" r="5" />
      </g>
    </>
  );
}

function PortfolioDrawing() {
  return (
    <>
      <g className="professional-subpage-field__structure">
        <path d="M184 94H1218V606H184Z" />
        <path d="M246 154H1156V544H246Z" />
        <path d="M246 432H1156M930 432V544M1016 432V544" />
        <path d="M328 218H604V374H328ZM650 218H1074V374H650Z" />
        <path d="M370 256H562V336H370ZM694 256H1030V336H694Z" />
        <path d="M294 476H730M294 502H668M950 468H1120M950 494H1120M950 520H1120" />
      </g>
      <g className="professional-subpage-field__dimensions">
        <path d="M184 56H1218M184 44V68M1218 44V68" />
        <path d="M140 94V606M128 94H152M128 606H152" />
        <path d="M328 400H1074M328 390V410M1074 390V410" />
      </g>
      <path
        className="professional-subpage-field__route"
        d="M76 566C262 460 326 640 504 520S744 432 882 500 1080 574 1364 412"
      />
      <g className="professional-subpage-field__nodes">
        <circle cx="246" cy="432" r="5" />
        <circle cx="604" cy="374" r="5" />
        <circle cx="930" cy="432" r="5" />
        <circle cx="1156" cy="544" r="5" />
      </g>
    </>
  );
}

function ContactDrawing() {
  return (
    <>
      <g className="professional-subpage-field__structure">
        <path d="M212 138 520 82 816 154 1158 104 1254 344 1090 590 732 614 398 556 176 350Z" />
        <path d="M520 82 548 286 816 154M548 286 732 614M548 286 398 556M548 286 1090 590M548 286 1158 104" />
        <path d="M346 214C434 154 566 154 650 212S846 282 950 214 1114 176 1190 242" />
        <path d="M292 404C424 332 536 398 650 444S880 510 1034 412 1192 376 1254 422" />
        <path d="M444 180 470 214 430 228ZM798 486 830 522 782 536ZM994 216 1022 252 978 264Z" />
      </g>
      <g className="professional-subpage-field__dimensions">
        <path d="M176 646H1254M176 634V658M1254 634V658" />
        <path d="M134 138V590M122 138H146M122 590H146" />
        <path d="M520 48H1158M520 36V60M1158 36V60" />
      </g>
      <path
        className="professional-subpage-field__route"
        d="M54 520C190 492 286 276 430 316S604 540 782 448 982 244 1138 304 1284 442 1384 392"
      />
      <g className="professional-subpage-field__nodes">
        <circle cx="430" cy="316" r="5" />
        <circle cx="548" cy="286" r="5" />
        <circle cx="782" cy="448" r="5" />
        <circle cx="1138" cy="304" r="5" />
      </g>
    </>
  );
}
