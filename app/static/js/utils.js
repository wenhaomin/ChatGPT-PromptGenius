/**
 * Utilities. These functions are general tools that are shared across the project.
 */

function masonry_reload(parent_dom, item_selector) {
    parent_dom.masonry({
        itemSelector: item_selector,
        columnWidth: item_selector,
        transitionDuration: 0,
        percentPosition: true
    }).masonry('reloadItems').masonry('layout');

    parent_dom.masonry({
        itemSelector: item_selector,
        columnWidth: item_selector,
        transitionDuration: 500,
        percentPosition: true
    });
}

function masonry_reload_on_images(parent_dom, item_selector) {
    var images = parent_dom.find('img');
    images.each(() => {
        if (this.complete) {
            $(this).trigger('load');
        }
    })
    images.on('load', () => {
        parent_dom.masonry({
            itemSelector: item_selector,
            columnWidth: item_selector,
            transitionDuration: 500,
            percentPosition: true
        }).masonry('reloadItems').masonry('layout');
    })
}

function hex_to_rgb(hex) {
    // If it is a shorthand 3 digit hex color, convert to full 6 digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
}

function rgb_to_hex(rgb) {
    rgb = rgb.slice(4, -1);
    var values = rgb.split(',');
    var hexValues = values.map(function (value) {
        var intValue = parseInt(value.trim(), 10);
        var hexValue = intValue.toString(16).padStart(2, '0');
        return hexValue;
    });
    var hexColor = hexValues.join('');

    return hexColor;
}

function value_to_hex(value, min, max, cmap) {
    if (value < min) value = min;
    if (value > max) value = max;
    return cmap(value).hex();
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function get_data(url) {
    try {
        const response = await $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json'
        });
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function send_post(url, data) {
    try {
        const response = await $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        console.error(error);
    }
}

// copy text
function copy_to_clipboard(text) {
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            mdui.snackbar('Failed to copy.');
            console.log(err);
        }
    }
    copyContent();
}

function warn_input(input) {
    input.addClass('border-danger');
    setTimeout(() => {
        input.removeClass('border-danger');
    }, 5000)
}

function validate_input(input_group, repeat_group) {
    var input_element = input_group.find('textarea, input');
    var input_val = input_element.val();

    if (input_val.length > 0) {
        input_element.removeClass('border-danger');

        if (repeat_group !== undefined) {
            var repeat_element = repeat_group.find('textarea, input');
            if (input_val !== repeat_element.val()) {
                warn_input(input_element);
                warn_input(repeat_element);
                return "";
            } else {
                input_element.removeClass('border-danger');
                repeat_element.removeClass('border-danger');
            }
        }
        return input_val;
    } else {
        warn_input(input_element);
        return "";
    }
}

function set_selected_value(select, value) {
    select.find('option').each((index, item) => {
        if ($(item).val() === value) {
            $(item).prop('selected', true);
        } else {
            $(item).prop('selected', false);
        }
    });
}

function get_selected_value(select) {
    return select.find(":selected").val();
}

function finished_state_btn(btn) {
    btn.find('.spinner-border').addClass('d-none');
    btn.find('.finished-indicator').removeClass('d-none');
    btn.removeClass('disabled');
    setTimeout(() => {
        btn.find('.finished-indicator').addClass('d-none');
    }, 1000);
}

function loading_state_btn(btn) {
    btn.find('.spinner-border').removeClass('d-none');
    btn.find('.finished-indicator').addClass('d-none');
    btn.addClass('disabled');
}

function show_error_message(container, error) {
    container.find('label[content="error-message"]').text(error);
    container.find('label[content="error-message"]').removeClass('d-none');
    setTimeout(() => {
        container.find('label[content="error-message"]').addClass('d-none');
        container.find('label[content="error-message"]').empty();
    }, 10000);
}

function show_warning_toast(content) {
    $('#warning-toast').find('span').text(content);
    warning_toast.show();
}

function gen_random_string(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function get_date_string() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
}