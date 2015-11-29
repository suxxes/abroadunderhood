import { initate as likely } from 'ilyabirman-likely';

likely();

jQuery(window).on('load resize', () => {
  jQuery('#content').css('paddingBottom', () => {
    return jQuery('#footer').outerHeight();
  });

  jQuery('#footer').css('marginTop', () => {
    return jQuery('#footer').outerHeight() * -1;
  });

  jQuery('.navbar-collapse.collapse').removeClass('collapsing in');

  jQuery('#scroll-spy').each(function () {
    const top = jQuery(this).offset().top;
    const bottom = jQuery('#footer').outerHeight(true);
    const width = jQuery(this).removeClass('affix').width();

    jQuery(this).width(width).affix({
      offset: {
        top: top,
        bottom: bottom
      }
    });
  });
});

const d = document; // eslint-disable-line id-length
const $ = d.querySelector.bind(d); // eslint-disable-line id-length

if ($('.js-stats')) {
  require([
    'moment',
    'tablesort',
    'imports?Tablesort=tablesort!tablesort/src/sorts/tablesort.numeric',
  ], (moment, tablesort) => {
    tablesort($('.host-stats'), { descending: true });

    const lastUpdated = $('.js-last-updated');
    const timestamp = lastUpdated.getAttribute('data-timestamp');
    lastUpdated.textContent = moment.unix(timestamp).locale('ru').fromNow();
  });
}
