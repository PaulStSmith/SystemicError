/* Consent is checked before Zoho's supplied signup handler can send the form. */
(() => {
  const form = document.getElementById('zcampaignOptinForm');
  if (!form) return;
  const email = document.getElementById('EMBED_FORM_EMAIL_LABEL');
  email.type = 'email';
  const validate = event => {
    if (!form.reportValidity()) { event.preventDefault(); event.stopImmediatePropagation(); }
  };
  form.addEventListener('click', event => {
    if (event.target.closest('[name="SIGNUP_SUBMIT_BUTTON"]')) validate(event);
  }, true);
  form.addEventListener('submit', validate, true);
})();
