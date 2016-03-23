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
  },
  receivedEvent: function (id) {
    console.log('Received Event: ' + id);
  },
  onDeviceReady: function () {
    app.receivedEvent('deviceready');

    moment.locale('es');
    app.updateSavedProperties();
  },
  onFormSubmit: function(event) {
    app.receivedEvent('submit');

    var id = Date.now();
    var data = $('#new_propiedad').serializeObject();
    data['created_at'] = id;

    var val = [];
    $(':checkbox:checked').each(function(i) {
      val[i] = $(this).val();
    });
    data['caracteristica_ids'] = val;

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
      'tipo_id',
      'direccion_exacta',
      'direccion_uso_interno',
      'descripcion_publica',
      'valor_compra',
      'valor_alquiler',
      'area_terreno',
      'area_construccion',
      'pisos',
      'dormitorios',
      'banos',
      'estacionamiento',
      'tipo_de_estacionamiento',
      'propietario_id',
      'opcion_compra',
      'incluye_mantenimiento',
      'cuota_mantenimiento',
      'area_terreno',
      'area_construccion',
      'sala_comedor',
      'patio',
      'patio_area',
      'amueblado',
      'linea_blanca',
      'fecha_construccion',
      'otros',
      'numero_plano_catastrado',
      'notas_uso_interno',
      'provincia',
      'canton',
      'distrito',
    ];
    var href = 'http://www.costa506realestate.com/admin/propiedad/new?';

    for (var i = 0; i < fields.length; i++) {
      if (data[fields[i]]) {
        href += 'propiedad[' + fields[i] + ']=' + encodeURIComponent(data[fields[i]]) + '&';
      }
    }

    href += 'propiedad[estado]=disponible&';
    href += 'return_to=' + encodeURIComponent('http://www.costa506realestate.com/admin/propiedad') + '&';

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

    return '<a href="' + href + '" target="_blank">Import to site</a>';
  },
  deletePropiedad: function() {
    app.receivedEvent('deletePropiedad');
    var id = $(this).attr('data-id');
    if (confirm('Are you sure?')) {
      localStorage.removeItem(id);
      app.updateSavedProperties();
    }
  }
};