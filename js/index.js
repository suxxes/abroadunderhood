import { initate as likely } from 'ilyabirman-likely';

likely();

jQuery(window).on('load', () => {
  if (document.getElementById('map')) {
    var markers = [];
    var mapCanvas = document.getElementById('map');
    var map = new google.maps.Map(mapCanvas, {
      center: new google.maps.LatLng(55.7522222, 37.6155556),
      zoom: 5,
      minZoom: 3,
      maxZoom: 8
    });

    authors.forEach((author, index) => {
      var marker = new RichMarker({
        map: map,
        position: new google.maps.LatLng(
          author.location[0],
          author.location[1]
        ),
        content: '<img class="marker ' + (false === author.current ? "archive" : "") + '" src="' + author.picture + '"/>',
        shadow: 0
      });

      if (false === author.current) {
        marker.addListener('click', () => {
          window.location.href = '/' + author.username;
        });
      }

      markers.push(marker);
    });

    map.addListener('zoom_changed', () => {
      markers.forEach((marker, index) => {
        var pixelSize = 24;
        var borderWidth = 1;
        var borderRadius = 2;

        switch (map.getZoom()) {
          case 4: pixelSize = 32; borderWidth = 1; borderRadius = 2; break;
          case 5: pixelSize = 40; borderWidth = 1; borderRadius = 4; break;
          case 6: pixelSize = 48; borderWidth = 2; borderRadius = 4; break;
          case 7: pixelSize = 56; borderWidth = 2; borderRadius = 8; break;
          case 8: pixelSize = 64; borderWidth = 2; borderRadius = 8; break;
        }

        marker.setContent(
          jQuery(marker.getContent()).css({
            'width': pixelSize,
            'height': pixelSize,
            'borderWidth': borderWidth,
            'borderRadius': borderRadius
          }).wrap('<div/>').parent().html()
        );
      });
    });
  }
});

jQuery(window).on('load resize', () => {
  jQuery('.carousel').carousel({
    pause: true,
    interval: false,
  });

  jQuery('#content').css('paddingBottom', () => {
    return jQuery('#footer').outerHeight();
  });

  jQuery('#footer').css('marginTop', () => {
    return jQuery('#footer').outerHeight() * -1;
  });

  jQuery('.navbar-collapse.collapse').removeClass('collapsing in');

  jQuery('#scroll-spy').each(function () {
    const is_affix = jQuery(this).hasClass('affix');
    const top = jQuery(this).offset().top;
    const bottom = jQuery('#footer').outerHeight();
    const width = jQuery(this).removeClass('affix').width();

    if (is_affix) {
      jQuery(this).addClass('affix');
    }

    jQuery(this).width(width).affix({
      offset: {
        top: top,
        bottom: bottom
      }
    });
  });

  jQuery(this).trigger('scroll');
});

jQuery(window).on('scroll', () => {
  jQuery('#scroll-spy').each(function () {
    if (jQuery(this).hasClass('affix')) {
      jQuery(this).css('position', '');
    }
  });
});

const d = document; // eslint-disable-line id-length
const $ = d.querySelector.bind(d); // eslint-disable-line id-length

if ($('.js-stats')) {
  require([
    'moment',
    'tablesort',
    'imports?Tablesort=tablesort!tablesort/src/sorts/tablesort.number',
  ], (moment, tablesort) => {
    tablesort($('.host-stats'), { descending: true });

    const lastUpdated = $('.js-last-updated');
    const timestamp = lastUpdated.getAttribute('data-timestamp');
    lastUpdated.textContent = moment.unix(timestamp).locale('ru').fromNow();
  });
}
