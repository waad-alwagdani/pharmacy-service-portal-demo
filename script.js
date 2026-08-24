// ---------- Application state ----------
const state = {
  step: 1,
  service: '',
  serviceAr: '',
};

// ---------- DOM references ----------
const form = document.getElementById('patientForm');
const successState = document.getElementById('successState');
const stepPanels = [...document.querySelectorAll('.panel')];
const stepNodes = [...document.querySelectorAll('.step')];
const serviceCards = [...document.querySelectorAll('.service-card')];
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const serviceTypeInput = document.getElementById('serviceType');
const serviceError = document.getElementById('serviceError');
const refillSection = document.getElementById('refillSection');
const feedbackSection = document.getElementById('feedbackSection');
const reviewBox = document.getElementById('reviewBox');
const submitError = document.getElementById('submitError');

const fields = {
  patientName: document.getElementById('patientName'),
  mrn: document.getElementById('mrn'),
  idIqama: document.getElementById('idIqama'),
  mobile: document.getElementById('mobile'),
  altMobile: document.getElementById('altMobile'),
  city: document.getElementById('city'),
  shortAddress: document.getElementById('shortAddress'),
  feedbackText: document.getElementById('feedbackText'),
  feedbackMrn: document.getElementById('feedbackMrn'),
  feedbackPhone: document.getElementById('feedbackPhone')
};

const errors = {
  patientName: document.getElementById('patientNameError'),
  mrn: document.getElementById('mrnError'),
  idIqama: document.getElementById('idIqamaError'),
  mobile: document.getElementById('mobileError'),
  altMobile: document.getElementById('altMobileError'),
  city: document.getElementById('cityError'),
  shortAddress: document.getElementById('shortAddressError'),
  clinic: document.getElementById('clinicError'),
  feedbackText: document.getElementById('feedbackTextError'),
  feedbackMrn: document.getElementById('feedbackMrnError'),
  feedbackPhone: document.getElementById('feedbackPhoneError')
};

const clinicInputs = [...document.querySelectorAll('input[name="clinic"]')];

// ---------- Input sanitization ----------
function sanitizeDigits(value) {
  return value.replace(/\D+/g, '');
}

function sanitizeAddress(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

['mrn','idIqama','mobile','altMobile','feedbackMrn','feedbackPhone'].forEach((key) => {
  fields[key].addEventListener('input', () => {
    fields[key].value = sanitizeDigits(fields[key].value);
    clearError(key);
  });
});

fields.shortAddress.addEventListener('input', () => {
  fields.shortAddress.value = sanitizeAddress(fields.shortAddress.value);
  clearError('shortAddress');
});

['patientName','city','feedbackText'].forEach((key) => {
  fields[key].addEventListener('input', () => clearError(key));
});

clinicInputs.forEach((input) => {
  input.addEventListener('change', () => clearError('clinic'));
});

// ---------- Service selection ----------
serviceCards.forEach((card) => {
  card.addEventListener('click', () => {
    state.service = card.dataset.service;
    state.serviceAr = card.dataset.serviceAr;
    serviceTypeInput.value = state.service;

    serviceCards.forEach((c) => {
      const selected = c === card;
      c.classList.toggle('selected', selected);
      c.setAttribute('aria-pressed', String(selected));
    });

    serviceError.textContent = '';
    toggleServiceSections();
  });
});

function toggleServiceSections() {
  const isRefill = state.service === 'Medication Refill';
  refillSection.classList.toggle('hidden', !isRefill);
  feedbackSection.classList.toggle('hidden', isRefill);
}

// ---------- Step navigation ----------
function setStep(step) {
  state.step = step;

  stepPanels.forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.panel) === step);
  });

  stepNodes.forEach((node) => {
    const nodeStep = Number(node.dataset.step);
    node.classList.toggle('active', nodeStep === step);
    node.classList.toggle('completed', nodeStep < step);
    node.querySelector('.step-circle').textContent =
      nodeStep < step ? '✓' : String(nodeStep);
  });

  backBtn.classList.toggle('hidden', step === 1);
  nextBtn.classList.toggle('hidden', step === 3);
  submitBtn.classList.toggle('hidden', step !== 3);

  submitError.classList.remove('active');
  submitError.textContent = '';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function setError(key, message) {
  if (fields[key]) {
    fields[key].classList.add('input-error');
  }

  if (errors[key]) {
    errors[key].textContent = message;
  }
}

function clearError(key) {
  if (fields[key]) {
    fields[key].classList.remove('input-error');
  }

  if (errors[key]) {
    errors[key].textContent = '';
  }
}

function clearAllErrors() {
  Object.keys(errors).forEach((key) => {
    if (fields[key]) {
      fields[key].classList.remove('input-error');
    }

    errors[key].textContent = '';
  });

  serviceError.textContent = '';
}

// ---------- Validation ----------
function validateStep1() {
  if (!state.service) {
    serviceError.textContent =
      'يرجى اختيار نوع الخدمة / Please select a service type.';

    return false;
  }

  return true;
}

function validateStep2() {
  clearAllErrors();

  let valid = true;

  const requiredMsg =
    'هذا الحقل إلزامي / This field is required.';

  if (state.service === 'Medication Refill') {

    if (!fields.patientName.value.trim()) {
      setError('patientName', requiredMsg);
      valid = false;
    }

    if (!/^\d{3,7}$/.test(fields.mrn.value)) {
      setError(
        'mrn',
        fields.mrn.value
          ? 'أدخل رقم ملف صحيحًا / Enter a valid medical record number.'
          : requiredMsg
      );

      valid = false;
    }

    if (!/^\d{10}$/.test(fields.idIqama.value)) {
      setError(
        'idIqama',
        fields.idIqama.value
          ? 'أدخل رقمًا صحيحًا من 10 أرقام / Enter exactly 10 digits.'
          : requiredMsg
      );

      valid = false;
    }

    if (!/^\d{10}$/.test(fields.mobile.value)) {
      setError(
        'mobile',
        fields.mobile.value
          ? 'أدخل رقمًا صحيحًا من 10 أرقام / Enter exactly 10 digits.'
          : requiredMsg
      );

      valid = false;
    }

    if (!/^\d{10}$/.test(fields.altMobile.value)) {
      setError(
        'altMobile',
        fields.altMobile.value
          ? 'أدخل رقمًا صحيحًا من 10 أرقام / Enter exactly 10 digits.'
          : requiredMsg
      );

      valid = false;
    }

    if (!fields.city.value.trim()) {
      setError('city', requiredMsg);
      valid = false;
    }

    if (!/^[A-Z]{4}\d{4}$/.test(fields.shortAddress.value)) {
      setError(
        'shortAddress',
        fields.shortAddress.value
          ? 'أدخل عنوانًا صحيحًا بصيغة 4 حروف و4 أرقام / Enter a valid code in 4 letters + 4 digits format.'
          : requiredMsg
      );

      valid = false;
    }

    if (!clinicInputs.some((input) => input.checked)) {
      errors.clinic.textContent =
        'يرجى اختيار عيادة واحدة على الأقل / Please select at least one clinic.';

      valid = false;
    }

  } else if (state.service === 'Suggestions & Complaints') {

    if (!fields.feedbackText.value.trim()) {
      setError('feedbackText', requiredMsg);
      valid = false;
    }

    if (!/^\d+$/.test(fields.feedbackMrn.value)) {
      setError(
        'feedbackMrn',
        fields.feedbackMrn.value
          ? 'أدخل رقم ملف صحيحًا / Enter a valid medical record number.'
          : requiredMsg
      );

      valid = false;
    }

    if (!/^\d{10}$/.test(fields.feedbackPhone.value)) {
      setError(
        'feedbackPhone',
        fields.feedbackPhone.value
          ? 'أدخل رقمًا صحيحًا من 10 أرقام / Enter exactly 10 digits.'
          : requiredMsg
      );

      valid = false;
    }
  }

  if (!valid) {
    const firstError =
      document.querySelector('.input-error');

    if (firstError) {
      firstError.focus();
    }
  }

  return valid;
}

// ---------- Helpers ----------
function getClinicValue() {
  return clinicInputs
    .filter((input) => input.checked)
    .map((input) => input.value)
    .join(' | ');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

// ---------- Review rendering ----------
function getReviewRows() {

  if (state.service === 'Medication Refill') {

    return [
      [
        'نوع الخدمة',
        'Service Type',
        `${state.serviceAr} / ${state.service}`
      ],
      [
        'اسم المريض',
        'Patient Name',
        fields.patientName.value.trim()
      ],
      [
        'رقم الملف الطبي',
        'Medical Record Number',
        fields.mrn.value
      ],
      [
        'رقم الهوية / الإقامة',
        'ID / Iqama Number',
        fields.idIqama.value
      ],
      [
        'رقم الجوال',
        'Mobile Number',
        fields.mobile.value
      ],
      [
        'رقم جوال بديل',
        'Alternative Mobile Number',
        fields.altMobile.value
      ],
      [
        'المدينة',
        'City',
        fields.city.value.trim()
      ],
      [
        'العنوان الوطني المختصر',
        'Short National Address',
        fields.shortAddress.value
      ],
      [
        'العيادة',
        'Selected Clinic(s)',
        getClinicValue()
      ]
    ];
  }

  return [
    [
      'نوع الخدمة',
      'Service Type',
      `${state.serviceAr} / ${state.service}`
    ],
    [
      'رقم الملف',
      'Medical Record Number',
      fields.feedbackMrn.value
    ],
    [
      'رقم الهاتف',
      'Phone Number',
      fields.feedbackPhone.value
    ],
    [
      'الاقتراح / الملاحظة',
      'Suggestion / Feedback',
      fields.feedbackText.value.trim()
    ]
  ];
}

function buildReview() {

  reviewBox.innerHTML = getReviewRows()
    .map(([ar, en, value]) => `
      <div class="review-item">
        <div class="review-label">
          <span class="ar">${ar}</span>
          <span class="en">${en}</span>
        </div>

        <div class="review-value">
          ${escapeHtml(value)}
        </div>
      </div>
    `)
    .join('');
}

// ---------- Demo submission ----------
async function simulateSubmission() {

  // Demo only.
  // No network request is made.
  // No entered data is transmitted or stored.

  await new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
}

// ---------- Success state ----------
function showSuccess() {

  form.classList.add('hidden');

  document
    .querySelector('.stepper')
    .classList.add('hidden');

  successState.classList.add('active');

  document.getElementById('successAr').textContent =
    state.service === 'Medication Refill'
      ? 'تمت محاكاة طلب إعادة الصرف بنجاح. لم يتم إرسال أو حفظ أي بيانات.'
      : 'تمت محاكاة إرسال الملاحظة بنجاح. لم يتم إرسال أو حفظ أي بيانات.';

  document.getElementById('successEn').textContent =
    state.service === 'Medication Refill'
      ? 'The refill workflow was simulated successfully. No data was sent or stored.'
      : 'The feedback workflow was simulated successfully. No data was sent or stored.';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ---------- Reset ----------
function resetForm() {

  state.step = 1;
  state.service = '';
  state.serviceAr = '';

  form.reset();

  clearAllErrors();

  serviceTypeInput.value = '';

  serviceCards.forEach((card) => {
    card.classList.remove('selected');
    card.setAttribute('aria-pressed', 'false');
  });

  clinicInputs.forEach((input) => {
    input.checked = false;
  });

  Object.values(fields).forEach((field) => {
    field.classList.remove('input-error');
  });

  document
    .querySelector('.stepper')
    .classList.remove('hidden');

  successState.classList.remove('active');

  form.classList.remove('hidden');

  toggleServiceSections();
  setStep(1);
}

// ---------- Event bindings ----------
nextBtn.addEventListener('click', () => {

  if (state.step === 1) {

    if (!validateStep1()) {
      return;
    }

    setStep(2);

    toggleServiceSections();

    return;
  }

  if (state.step === 2) {

    if (!validateStep2()) {
      return;
    }

    buildReview();

    setStep(3);
  }
});

backBtn.addEventListener('click', () => {

  if (state.step > 1) {
    setStep(state.step - 1);
  }
});

submitBtn.addEventListener('click', async () => {

  if (!validateStep2()) {
    setStep(2);
    return;
  }

  submitBtn.disabled = true;

  submitBtn.textContent =
    'جاري الإرسال / Sending';

  submitError.classList.remove('active');

  submitError.textContent = '';

  try {

    await simulateSubmission();

    showSuccess();

  } catch (error) {

    submitError.textContent =
      error.message ||
      'تعذر الإرسال حاليًا. يرجى المحاولة مرة أخرى / Unable to submit right now. Please try again.';

    submitError.classList.add('active');

  } finally {

    submitBtn.disabled = false;

    submitBtn.textContent =
      'إرسال الطلب / Submit Request';
  }
});

document
  .getElementById('newRequestBtn')
  .addEventListener('click', resetForm);

// ---------- Initial state ----------
setStep(1);

toggleServiceSections();
