(function () {
  var DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var WEEKDAY_SLOTS = { 'Mañana': ['9:30', '10:30', '11:30', '12:30'], 'Tarde': ['16:00', '17:00', '18:00', '19:00'] };
  var SATURDAY_SLOTS = { 'Mañana': ['10:00', '11:00', '12:00', '13:00'] };

  var daysEl = document.getElementById('days');
  var slotsEl = document.getElementById('slots');
  var form = document.getElementById('booking');
  var done = document.getElementById('done');
  var err = document.getElementById('err');
  document.getElementById('year').textContent = new Date().getFullYear();

  // Próximos 6 días con consulta (sin domingos), empezando mañana
  var dates = [];
  var d = new Date(); d.setHours(0, 0, 0, 0);
  while (dates.length < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) dates.push(new Date(d));
  }

  dates.forEach(function (date, i) {
    var id = 'day-' + i;
    var wrap = document.createElement('label');
    wrap.className = 'chip'; wrap.htmlFor = id;
    wrap.innerHTML = '<input type="radio" name="dia" id="' + id + '" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span><small>' + DAYS[date.getDay()] + '</small>' + date.getDate() + ' ' + MONTHS[date.getMonth()] + '</span>';
    daysEl.appendChild(wrap);
  });

  function renderSlots() {
    var idx = +form.querySelector('input[name="dia"]:checked').value;
    var groups = dates[idx].getDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
    slotsEl.innerHTML = '';
    var n = 0;
    Object.keys(groups).forEach(function (g) {
      var box = document.createElement('div'); box.className = 'slot-group';
      box.innerHTML = '<p>' + g + '</p>';
      var chips = document.createElement('div'); chips.className = 'chips';
      groups[g].forEach(function (t) {
        var id = 'slot-' + (n++);
        var l = document.createElement('label'); l.className = 'chip'; l.htmlFor = id;
        l.innerHTML = '<input type="radio" name="hora" id="' + id + '" value="' + t + '"><span>' + t + '</span>';
        chips.appendChild(l);
      });
      box.appendChild(chips);
      slotsEl.appendChild(box);
    });
  }
  daysEl.addEventListener('change', renderSlots);
  renderSlots();

  function fail(msg, el) { err.textContent = msg; err.hidden = false; if (el) el.focus(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var hora = form.querySelector('input[name="hora"]:checked');
    var nombre = form.nombre.value.trim();
    var tel = form.telefono.value.replace(/\s+/g, '');
    var email = form.email.value.trim();
    if (!hora) return fail('Elige una hora para tu cita.', slotsEl.querySelector('input'));
    if (nombre.length < 3) return fail('Escribe tu nombre y apellidos.', form.nombre);
    if (!/^\+?\d{9,15}$/.test(tel)) return fail('Revisa el teléfono: necesitamos al menos 9 dígitos.', form.telefono);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Revisa el email o déjalo en blanco.', form.email);
    if (!form.acepto.checked) return fail('Para reservar, acepta el uso de tus datos para gestionar la cita.', form.acepto);

    var date = dates[+form.querySelector('input[name="dia"]:checked').value];
    var data = {
      motivo: form.motivo.value,
      fecha: DAYS[date.getDay()] + ' ' + date.getDate() + ' ' + MONTHS[date.getMonth()],
      hora: hora.value, nombre: nombre, telefono: tel, email: email
    };

    // PARA PUBLICAR: aquí se envían los datos a la clínica.
    // Conecta este formulario con Formspree, Google Forms, tu CRM o un webhook, por ejemplo:
    // fetch('https://formspree.io/f/TU_ID', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    var rows = [['Motivo', data.motivo], ['Fecha', data.fecha], ['Hora', data.hora], ['Nombre', data.nombre], ['Teléfono', data.telefono]];
    var dl = document.getElementById('summary'); dl.innerHTML = '';
    rows.forEach(function (r) {
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    form.hidden = true; done.hidden = false;
  });

  document.getElementById('again').addEventListener('click', function () {
    form.reset(); renderSlots(); done.hidden = true; form.hidden = false; err.hidden = true;
  });
})();
