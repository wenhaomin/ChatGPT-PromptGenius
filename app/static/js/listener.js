/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Listener functions.
 */

function prompt_search_listener() {
    var search_text = validate_input($('#search-input-group'));
    if (search_text.length > 0) {
        $('.class-nav-link, .child-class-nav-link').removeClass('active');
        render_search_prompt_by_string(search_text, cur_lan_code)
    }
}

function back_top_listener() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function scroll_listenser() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 180) {
        $('#back-top-btn').removeClass('mdui-fab-hide');
    } else {
        $('#back-top-btn').addClass('mdui-fab-hide');
    }
}

function submit_clear_listener() {
    $('#submit-dialog input').val('');
    $('#submit-dialog textarea').val('');
}

function validate_input(input_group) {
    var input_element = input_group.find('textarea, input');
    var input_val = input_element.val();

    if (input_val.length > 0) {
        input_element.removeClass('border-danger');
    } else {
        input_element.addClass('border-danger');
    }
    return input_val;
}

function submit_enter_listener() {
    var func_desc = validate_input($('#submit-dialog-funcdesc-group'));
    var prompt_content = validate_input($('#submit-dialog-prompt-group'));
    var user_name = $('#submit-dialog-prompt-user-group input').val();
    if (func_desc.length > 0 & prompt_content.length > 0) {
        $('#submit-enter-btn-spinner').removeClass('d-none');
        $.ajax({
            type: 'POST',
            url: '/submit_function',
            contentType: 'application/json',
            data: JSON.stringify({
                func_desc: func_desc,
                prompt_content: prompt_content,
                user_name: user_name
            }),
            success: () => {
                $('#submit-enter-btn-spinner').addClass('d-none');
                submit_dialog_bs.hide();
            }
        })
    }
}