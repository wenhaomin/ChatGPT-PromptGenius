/**
 * Listeners and control functions. These functions define the behavior of elements on the page.
 */


function language_select_listener(selected_lan_code) {
    if (cur_lan_code !== selected_lan_code) {
        cur_lan_code = selected_lan_code;
        switch_active_language(selected_lan_code);
        set_cookie('lancode', cur_lan_code, 30);
        switch_language_listener();
        action_sidebar_bs.hide();
    }
}

function switch_active_language(selected_lan_code) {
    // Change the selected option of #language-select to the given lan_code.
    $('#nav-language-select').children('li').each((index, item) => {
        if ($(item).attr('lan-code') === selected_lan_code) {
            $(item).children('a').addClass('active');
        } else {
            $(item).children('a').removeClass('active');
        }
    });
}

function class_select_listener(selected_class_id) {
    if (cur_selected_class !== selected_class_id) {
        cur_selected_class = selected_class_id;
        switch_active_class(cur_selected_class);

        render_prompt_by_class(cur_selected_class, cur_lan_code);
        class_sidebar_bs.hide();

        set_cookie('selected_class', cur_selected_class, 30);
    }
}

function switch_active_class(selected_class_id, scroll) {
    if (selected_class_id === 'popular') {
        $('#top-banner').show('blind', 600);
    } else {
        $('#top-banner').hide('blind', 600);
    }

    var all_class_nav = $('.class-nav-link, .child-class-nav-link');
    all_class_nav.removeClass('active');
    all_class_nav.each((index, item) => {
        if ($(item).attr('class-id') === selected_class_id) {
            $(item).addClass('active');
            if (scroll) {
                $('#class-sidebar-scroller').scrollTop($(item).position().top - $('#class-sidebar-scroller').height() / 2);
            }
        }
    });
}

function load_cookie_class() {
    var saved_selected_class = get_cookie('selected_class');
    if (saved_selected_class !== "" && saved_selected_class !== undefined) {
        cur_selected_class = saved_selected_class;
    } else {
        cur_selected_class = "popular";
    }
}

function copy_btn_click_listener(btn, text) {
    copy_to_clipboard(text.trim());
    btn.find('.bi').switchClass('bi-clipboard', 'bi-clipboard-check-fill');
    setTimeout(() => {
        btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
    }, 2000);
}

function example_btn_click_listener(btn, function_id, semantic_id, lan_code) {
    btn.find('.spinner-border').removeClass('d-none');
    btn.find('.bi').addClass('d-none');
    render_prompt_example_display(function_id, semantic_id, lan_code).then(() => {
        btn.find('.spinner-border').addClass('d-none');
        btn.find('.bi').removeClass('d-none');
    });
}

function gain_popularity_listener(card, function_id, semantic_id, lan_code, increase) {
    var pop_display = card.find('.popularity-badge span')
    var cur_pop = parseInt(pop_display.text());
    pop_display.text(cur_pop + increase);
    send_post(`increase_popularity`,
        {
            'lan_code': lan_code, 'function_id': function_id,
            'semantic_id': semantic_id, 'increase': increase
        });
}

function prompt_search_listener() {
    var search_text = validate_input($('#search-input-group'));
    if (search_text.length > 0) {
        action_sidebar_bs.hide();
        cur_selected_class = '';
        switch_active_class(cur_selected_class);
        render_prompt_by_string(search_text, cur_lan_code)
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
    var user_name = $('#submit-dialog-user-group input').val();
    if (func_desc.length > 0 & prompt_content.length > 0) {
        $('#submit-enter-btn-spinner').removeClass('d-none');
        send_post('/submit_function', {
            'func_desc': func_desc,
            'prompt_content': prompt_content,
            'user_name': user_name
        }).then(() => {
            $('#submit-enter-btn-spinner').addClass('d-none');
            $('#submit-ok-indicator').removeClass('d-none');
            setTimeout(() => {
                submit_dialog_bs.hide();
                $('#submit-ok-indicator').addClass('d-none');
                submit_clear_listener();
            }, 1000);
        });
    }
}

function not_implemented_listener() {
    $('#warning-toast').find('span').text(warning_contents[cur_lan_code]['not_implemented']);
    warning_toast.show();
}