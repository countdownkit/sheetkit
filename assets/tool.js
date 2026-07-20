// Sheet controls: title, row count, orientation, date line, print.
// The sheet itself is server-rendered; this only adjusts it.
(function () {
  const sheet = document.querySelector("[data-sheet]");
  if (!sheet) return;
  const tbl = sheet.querySelector(".sheet-tbl");
  const titleEl = sheet.querySelector(".sheet-title");
  const dateline = sheet.querySelector(".dateline");
  const ctl = name => document.querySelector(`[data-ctl=${name}]`);

  // Orientation is a real @page rule so the print dialog defaults correctly.
  const pageStyle = document.createElement("style");
  document.head.appendChild(pageStyle);
  function setOrient(o) {
    pageStyle.textContent = `@page { size: letter ${o}; margin: 0.5in; }`;
    sheet.classList.toggle("landscape", o === "landscape");
  }

  function setRows(n) {
    const cols = tbl.querySelectorAll("thead th").length - 1; // minus the # column
    const tbody = tbl.querySelector("tbody");
    tbody.innerHTML = Array.from({ length: n }, (_, i) =>
      `<tr><td class="rownum">${i + 1}</td>${"<td></td>".repeat(cols)}</tr>`).join("");
  }

  ctl("title").addEventListener("input", e => { titleEl.textContent = e.target.value; });
  titleEl.addEventListener("input", () => { ctl("title").value = titleEl.textContent; });
  ctl("rows").addEventListener("change", e => setRows(+e.target.value));
  ctl("orient").addEventListener("change", e => setOrient(e.target.value));
  ctl("dateline").addEventListener("change", e => { dateline.style.display = +e.target.value ? "" : "none"; });
  ctl("print").addEventListener("click", () => window.print());

  setOrient(ctl("orient").value);
})();
