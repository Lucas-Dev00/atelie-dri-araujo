/**
 * Simulador "Monte Sua Festa" — Ateliê Dri Araújo
 * Atualiza seleção, resumo, total e encaminhamento para o WhatsApp.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#party-form");
  const selectedItems = document.querySelector("#selected-items");
  const totalValue = document.querySelector("#total-value");
  const whatsAppButton = document.querySelector("#whatsapp-button");
  const packageStep = form
    .querySelector('input[name="package"]')
    .closest(".step");

  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  /** Lê o atributo data-price sem permitir valores inválidos no cálculo. */
  const getPrice = (input) => Number(input?.dataset.price || 0);

  /** Sincroniza a classe visual dos cards com o estado nativo dos inputs. */
  function updateSelectedCards() {
    form.querySelectorAll(".choice-card input").forEach((input) => {
      input.closest(".choice-card").classList.toggle("selected", input.checked);
    });
  }

  /** Preenche a lista compacta do resumo do orçamento. */
  function updateSummary(theme, selectedPackage, extras) {
    const choices = [];

    if (theme) choices.push({ label: `Tema: ${theme.value}`, price: null });
    if (selectedPackage) {
      choices.push({
        label: selectedPackage.value,
        price: getPrice(selectedPackage),
      });
    }
    extras.forEach((extra) =>
      choices.push({ label: extra.value, price: getPrice(extra) }),
    );

    selectedItems.innerHTML = choices.length
      ? choices
          .map(
            ({ label, price }) => `
          <li>
            <span>${label}</span>
            ${price === null ? "" : `<b>${currency.format(price)}</b>`}
          </li>
        `,
          )
          .join("")
      : '<li class="empty-state">Escolha suas opções para começar.</li>';
  }

  /** Calcula e apresenta o valor atualizado a cada interação. */
  function calculateBudget() {
    const theme = form.querySelector('input[name="theme"]:checked');
    const selectedPackage = form.querySelector('input[name="package"]:checked');
    const extras = [...form.querySelectorAll('input[name="extra"]:checked')];
    const total =
      getPrice(selectedPackage) +
      extras.reduce((sum, extra) => sum + getPrice(extra), 0);

    totalValue.textContent = currency.format(total);
    updateSummary(theme, selectedPackage, extras);

    // O pulso só aparece quando existe valor para finalizar, evitando distração inicial.
    whatsAppButton.classList.toggle("is-ready", total > 0);

    return { theme, selectedPackage, extras, total };
  }

  /** Exibe um alerta acessível e chama atenção para a etapa obrigatória. */
  function showPackageError() {
    let alert = document.querySelector("#form-alert");

    if (!alert) {
      alert = document.createElement("p");
      alert.id = "form-alert";
      alert.className = "form-alert";
      alert.setAttribute("role", "alert");
      packageStep.prepend(alert);
    }

    alert.textContent =
      "Escolha um pacote para que possamos preparar seu orçamento.";
    packageStep.classList.remove("needs-attention");
    // Reinicia a animação caso o usuário tente novamente.
    void packageStep.offsetWidth;
    packageStep.classList.add("needs-attention");
    packageStep.scrollIntoView({ behavior: "smooth", block: "center" });

    window.clearTimeout(showPackageError.timeoutId);
    showPackageError.timeoutId = window.setTimeout(() => {
      packageStep.classList.remove("needs-attention");
      alert.remove();
    }, 4500);
  }

  form.addEventListener("change", () => {
    updateSelectedCards();
    calculateBudget();

    // Uma seleção válida remove imediatamente o destaque de erro.
    if (form.querySelector('input[name="package"]:checked')) {
      packageStep.classList.remove("needs-attention");
      document.querySelector("#form-alert")?.remove();
    }
  });

  whatsAppButton.addEventListener("click", (event) => {
    event.preventDefault();
    const { theme, selectedPackage, extras, total } = calculateBudget();

    if (!selectedPackage) {
      showPackageError();
      return;
    }

    const extrasText = extras.length
      ? extras
          .map(
            (extra) => `• ${extra.value} — ${currency.format(getPrice(extra))}`,
          )
          .join("\n")
      : "Nenhum adicional selecionado";

    const message = [
      "✨ *NOVO ORÇAMENTO DO SITE - ATELIÊ DRI ARAÚJO*",
      "",
      `*Tema:* ${theme?.value || "Não informado"}`,
      `*Pacote:* ${selectedPackage.value} — ${currency.format(getPrice(selectedPackage))}`,
      "*Adicionais:*",
      extrasText,
      "",
      `*Valor Total Estimado: ${currency.format(total)}*`,
    ].join("\n");

    // Número informado pelo Ateliê. O WhatsApp exige o número no formato internacional.
    const whatsAppNumber = "5511939098308";
    const url = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  updateSelectedCards();
  calculateBudget();
});
