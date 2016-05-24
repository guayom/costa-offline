var app = {
  initialize: function () {
    this.bindEvents();
  },
  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false);

    document.addEventListener('online', function () {
      app.receivedEvent('online');

      var $navbar = $('#navbar');
      $navbar.removeClass('offline');
      $navbar.addClass('online');

      $('.show-offline').hide();
      $('.show-online').show();
    }, false);

    document.addEventListener('offline', function () {
      app.receivedEvent('offline');

      var $navbar = $('#navbar');
      $navbar.removeClass('online');
      $navbar.addClass('offline');

      $('.show-online').hide();
      $('.show-offline').show();

    }, false);

    document.addEventListener('submit', this.onFormSubmit, false);

    $('#clear_all').click(function() {
      app.receivedEvent('clearAllPropiedades');
      if (confirm('Are you sure?')) {
        $('#propiedades .fake-link').each(function() {
          localStorage.removeItem($(this).attr('data-id'));
        });
        app.updateSavedProperties();
      }
    });

    $('#refresh').click(this.onRefreshData);
    this.updateTipos();
    this.updateProvincias();
    this.updateCantones();
    this.updateDistritos();
    this.updateCaracteristicas();
    this.updateMensajes();
    this.updatePropietarios();
    $('#provincia').change();

    this.updateTiposCaracteristicas();
    this.updateTiposHiddenFields();
  },
  receivedEvent: function (id) {
    app.updateLocations();

    console.log('Received Event: ' + id);
  },
  onDeviceReady: function () {
    app.receivedEvent('deviceready');

    $.ajaxSetup({ cache: false });
    moment.locale('es');
    app.updateSavedProperties();

    $('#email').val(localStorage.getItem('email'));
    $('#password').val(localStorage.getItem('password'));
  },
  onFormSubmit: function(event) {
    app.receivedEvent('submit');

    var id = Date.now();
    var data = $('#new_propiedad').serializeObject();
    data['created_at'] = id;

    localStorage.setItem(id, JSON.stringify(data));
    app.updateSavedProperties();
    document.forms['new_propiedad'].reset();

    $('body,html').animate({
      scrollTop: 0
    }, 400);
    $('#titular').focus();

    event.preventDefault();
  },
  updateSavedProperties: function() {
    app.receivedEvent('updateSavedProperties');

    $('#propiedades').html('');
    var foundKeys = 0;
    for (var k = 0; k < localStorage.length; k++) {
      var key = localStorage.key(k);
      if (parseInt(key) == key) {
        var tr = $('<tr></tr>');
        var data = JSON.parse(localStorage.getItem(key));

        tr.append($('<td></td>').text(data['titular']));

        tr.append($('<td></td>').text(
          moment(parseFloat(data['created_at'])).format('L'))
        );

        tr.append($('<td></td>', {
          class: 'show-online'
        }).html(app.linkToPropiedad(data)));

        var span = $('<span></span>',  {
          class: 'fake-link',
          'data-id': data['created_at']
        }).text('Eliminar').click(this.deletePropiedad);
        tr.append($('<td></td>').html(span));

        $('#propiedades').append(tr);

        foundKeys++;
      }
    }

    if (0 == foundKeys) {
      $('#propiedades_table').hide();
    } else {
      $('#propiedades_table').show();
    }
  },
  linkToPropiedad: function(data) {
    var fields = [
      'listado',
      'titular',
      'propietario_id',
      'direccion_exacta',
      'direccion_uso_interno',
      'descripcion_publica',
      'moneda',
      'valor_compra',
      'valor_alquiler',
      'opcion_compra',
      'incluye_mantenimiento',
      'cuota_mantenimiento',
      'area_terreno',
      'area_construccion',
      'pisos',
      'dormitorios',
      'oficinas',
      'banos',
      'sala_comedor',
      'patio',
      'patio_area',
      'estacionamiento',
      'tipo_de_estacionamiento',
      'amueblado',
      'linea_blanca',
      'fecha_construccion',
      'otros',
      'numero_plano_catastrado',
      'notas_uso_interno',
      'provincia',
      'canton',
      'distrito',
      'cuarto_de_servicio',
      'cuota_mantenimiento_moneda',
      'comision'
    ];
    var href = 'http://www.costa506realestate.com/admin/propiedad/new?';

    for (var i = 0; i < fields.length; i++) {
      if (data[fields[i]]) {
        href += 'propiedad[' + fields[i] + ']=' + encodeURIComponent(data[fields[i]]) + '&';
      }
    }

    href += 'propiedad[estado]=disponible&';
    href += 'return_to=' + encodeURIComponent('http://www.costa506realestate.com/admin/propiedad') + '&';

    if (!$.isArray(data['tipo_ids'])) {
      var x = data['tipo_ids'];
      data['tipo_ids'] = [x];
    }

    if (data['tipo_ids']) {
      for (var j = 0; j < data['tipo_ids'].length; j++) {
        href += 'propiedad[tipo_ids][]=' + data['tipo_ids'][j] + '&';
      }
    }

    if (!$.isArray(data['caracteristica_ids'])) {
      var y = data['caracteristica_ids'];
      data['caracteristica_ids'] = [y];
    }

    if (data['caracteristica_ids']) {
      for (var j = 0; j < data['caracteristica_ids'].length; j++) {
        href += 'propiedad[caracteristica_ids][]=' + data['caracteristica_ids'][j] + '&';
      }
    }

    if (data['mensaje_ids']) {
      for (var j = 0; j < data['mensaje_ids'].length; j++) {
        href += 'propiedad[mensaje_ids][]=' + data['mensaje_ids'][j] + '&';
      }
    }

    var compra = parseInt(data['valor_compra']) > 0;
    var alquiler = parseInt(data['valor_alquiler']) > 0;
    if (compra && alquiler) {
      href += 'propiedad[listado]=venta_alquiler';
    } else if (compra > 0) {
      href += 'propiedad[listado]=venta';
    } else if (alquiler > 0) {
      href += 'propiedad[listado]=alquiler';
    }

    return '<a href="#" onclick="window.open(\'' + href + '\', \'_system\'); return false;">Import to site</a>';
  },
  deletePropiedad: function() {
    app.receivedEvent('deletePropiedad');
    var id = $(this).attr('data-id');
    if (confirm('Are you sure?')) {
      localStorage.removeItem(id);
      app.updateSavedProperties();
    }
  },
  onRefreshData: function() {
    app.receivedEvent('onRefreshData');

    $.ajaxSetup({
      cache: false
    });

    localStorage.setItem('email', $('#email').val());
    localStorage.setItem('password', $('#password').val());

    var auth = 'email=' + localStorage.getItem('email') + '&password=' + localStorage.getItem('password');

    $.getJSON('http://www.costa506realestate.com/tipos.json?' + auth, function(data) {
    // $.getJSON('http://localhost:3000/tipos.json?' + auth, function(data) {
      localStorage.setItem('tipos', JSON.stringify(data));
      app.updateTipos();

      $.getJSON('http://www.costa506realestate.com/provincias.json?' + auth, function(data) {
        localStorage.setItem('provincias', JSON.stringify(data));
        app.updateProvincias();
      });
      $.getJSON('http://www.costa506realestate.com/cantones.json?' + auth, function(data) {
        localStorage.setItem('cantones', JSON.stringify(data));
        app.updateCantones();
      });
      $.getJSON('http://www.costa506realestate.com/distritos.json?' + auth, function(data) {
        localStorage.setItem('distritos', JSON.stringify(data));
        app.updateDistritos();
      });
      $.getJSON('http://www.costa506realestate.com/caracteristicas.json?' + auth, function(data) {
        localStorage.setItem('caracteristicas', JSON.stringify(data));
        app.updateCaracteristicas();
      });
      $.getJSON('http://www.costa506realestate.com/mensajes.json?' + auth, function(data) {
        localStorage.setItem('mensajes', JSON.stringify(data));
        app.updateMensajes();
      });
      $.getJSON('http://www.costa506realestate.com/propietarios.json?' + auth, function(data) {
        localStorage.setItem('propietarios', JSON.stringify(data));
        app.updatePropietarios();
      });

      $('#provincia').change();
    }).fail(function(e) {
      if (401 == parseInt(e.status)) {
        alert('Wrong email or password!');
      }
    });
  },
  updateTipos: function() {
    var tipos = localStorage.getItem('tipos');
    if (tipos != null) {
      $('#tipos').html('');

      caracteristicasTipos = {};
      tiposHiddenFields = {};

      $(JSON.parse(tipos)).each(function() {
        tiposHiddenFields[this['id']] = this['hidden_ids'];
        caracteristicasTipos[this['id']] = this['car_ids'];

        $('#tipos').append(
          $('<div></div>', {class: 'checkbox'}).html(
            $('<label></label>').html([
              $('<input>', {
                type: 'checkbox',
                name: 'tipo_ids',
                value: this['id']
              }),
              this['titulo']
            ])
          )
        );
      });
    }
  },
  updateProvincias: function() {
    var provincias = localStorage.getItem('provincias');
    console.log(provincias);
    if (provincias != null) {
      $('#provincia').html('');
      $('#provincia').append(
        $('<option></option>', { value: '' }).text('Buscar')
      );

      $(JSON.parse(provincias)).each(function() {
        $('#provincia').append(
          $('<option></option>', { value: this['nombre'] }).attr('data-provincia-id', this['id']).text(this['nombre'])
        );
      });
    }
  },
  updateCantones: function() {
    var cantones = localStorage.getItem('cantones');
    if (cantones != null) {
      $('#canton_copy').html('');
      $('#canton_copy').append(
        $('<option></option>', { value: '' }).text('Buscar')
      );

      $(JSON.parse(cantones)).each(function() {
        $('#canton_copy').append(
          $('<option></option>', { value: this['nombre'] }).attr('data-provincia-id', this['provincia_id']).attr('data-canton-id', this['canton_id']).text(this['nombre'])
        );
      });
    }
  },
  updateDistritos: function() {
    var distritos = localStorage.getItem('distritos');
    if (distritos != null) {
      $('#distrito_copy').html('');
      $('#distrito_copy').append(
        $('<option></option>', { value: '' }).text('Buscar')
      );

      $(JSON.parse(distritos)).each(function() {
        $('#distrito_copy').append(
          $('<option></option>', { value: this['nombre'] }).attr('data-provincia-id', this['provincia_id']).attr('data-canton-id', this['canton_id']).text(this['nombre'])
        );
      });
    }
  },
  updatePropietarios: function() {
    var propietarios = localStorage.getItem('propietarios');
    if (propietarios != null) {
      $('#propietario_id').html('');
      $('#propietario_id').append(
        $('<option></option>', { value: '' }).text('Buscar')
      );

      $(JSON.parse(propietarios)).each(function() {
        $('#propietario_id').append(
          $('<option></option>', { value: this['id'] }).text(
            this['nombre'] + ' ' + this['apellido'] + ', ' + this['celular']
          )
        );
      });
    }
  },
  updateCaracteristicas: function() {
    var caracteristicas = localStorage.getItem('caracteristicas');
    if (caracteristicas != null) {
      $('#caracteristicas').html('');

      $(JSON.parse(caracteristicas)).each(function() {
        $('#caracteristicas').append(
          $('<div></div>', {class: 'checkbox'}).html(
            $('<label></label>').html([
              $('<input>', {
                type: 'checkbox',
                name: 'caracteristica_ids',
                value: this['id']
              }),
              this['titulo']
            ])
          )
        );
      });
    }
  },
  updateMensajes: function() {
    var mensajes = localStorage.getItem('mensajes');
    if (mensajes != null) {
      $('#mensajes').html('');

      $(JSON.parse(mensajes)).each(function() {
        $('#mensajes').append(
          $('<div></div>', {class: 'checkbox'}).html(
            $('<label></label>').html([
              $('<input>', {
                type: 'checkbox',
                name: 'mensaje_ids',
                value: this['id']
              }),
              this['mensaje']
            ])
          )
        );
      });
    }
  },
  updateLocations: function() {
    $('#provincia').change(function() {
      if ($(this).val().length > 0) {
        $('.distrito-control').hide();

        var provinciaId = $(this).children(':selected').data('provincia-id');
        $('#canton_copy').clone(true).attr({
          'id': 'canton',
          'name': 'canton',
          'class': 'form-control',
          'style': 'display: block;'
        }).replaceAll('#canton');

        $('#canton option').each(function() {
          $(this).show();
          if ($(this).val().length > 0 && $(this).data('provincia-id') != provinciaId) {
            $(this).remove();
          }
        });
        $('.canton-control').show();
      } else {
        $('.distrito-control').hide();
        $('.canton-control').hide();
        $('#canton').val('');
      }
    });

    $('#canton_copy').change(function() {
      if ($(this).val() && $(this).val().length > 0) {
        var provinciaId = $('#provincia').children(':selected').data('provincia-id');
        var cantonId = $(this).children(':selected').data('canton-id');

        $('#distrito_copy').clone(true).attr({
          'id': 'distrito',
          'name': 'distrito',
          'class': 'form-control',
          'style': 'display: block;'
        }).replaceAll('#distrito');

        $('#distrito option').each(function() {
          $(this).show();
          if ($(this).val().length > 0 && !($(this).data('provincia-id') == provinciaId && $(this).data('canton-id') == cantonId)) {
            $(this).remove();
          }
        });
        $('.distrito-control').show();
      } else {
        $('.distrito-control').hide();
        $('#distrito').val('');
      }
    });
  },
  updateTiposCaracteristicas: function() {
    $('#tipos input').change(function() {
      $('#caracteristicas input').each(function() {
        $(this).closest('div').hide();
      });
      $('[name="tipo_ids"]:checked').each(function() {
        // var tipoId = this.value;
        // if (caracteristicasTipos[tipoId].length > 0) {
          caracteristicasTipos[this.value].forEach(function(caracteristicaId) {
            $('#caracteristicas [value="' + caracteristicaId + '"]').closest('div').show();
          });
        // }
      });
    });
    $('#tipos input').eq(0).change();
  },
  updateTiposHiddenFields: function() {
    $('#tipos input').change(function() {
      $('.tipos-hidden').each(function() {
        $(this).removeClass('tipos-hidden');
        $(this).show();
      });

      $('[name="tipo_ids"]:checked').each(function() {
        tiposHiddenFields[this.value].forEach(function(hiddenName) {
          $('.' + hiddenName + '-field').hide();
          $('.' + hiddenName + '-field').addClass('tipos-hidden');
        });
      });
    });
    $('#tipos input').eq(0).change();
  }
};
