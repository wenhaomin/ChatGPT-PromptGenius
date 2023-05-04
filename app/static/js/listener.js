/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Listener functions.
 */

async function languageSelectListenser() {
    $('#main-bar').switchClass('normal-bar', 'loading-bar', 500);

    let selected_lan_code = $('#language-select').find(':selected').val();
    cur_lan_code = selected_lan_code;
    switch_selected_language(selected_lan_code);
    await render_page_basic(selected_lan_code);
    await render_tools(selected_lan_code);
    await render_search_prompt_by_class(cur_class, selected_lan_code);
    await render_class_tree(selected_lan_code);

    // If the user changed language, save language code to cookie.
    // The cookie will be expired after 30 days.
    set_cookie("lancode", cur_lan_code, 30);

    $('#main-bar').switchClass('loading-bar', 'normal-bar', 500);
}

function prompt_search_listener() {
    var search_text = $("#search-input").val();
    console.log(search_text);
    render_search_prompt_by_string(search_text, cur_lan_code)
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

function submit_dialog_open_listener() {
    $('#submit-dialog .mdui-textfield').removeClass('mdui-textfield-invalid');
    $('#submit-dialog textarea').val("");
    submit_dialog.open();
}

function submit_enter_listener() {
    var func_desc = validate_textarea('submit-dialog-funcdesc-tf');
    var prompt_content = validate_textarea('submit-dialog-prompt-tf');
    var user_name = $('#submit-dialog-username-tf textarea').val();
    var submit_btn_text_origin = $('#submit-enter-btn').text();
    if (func_desc.length > 0 & prompt_content.length > 0) {
        $('#submit-enter-btn').text('...');
        $.ajax({
            type: 'POST',
            url: '/submit_function',
            contentType: 'application/json',
            data: JSON.stringify({
                func_desc: func_desc,
                prompt_content: prompt_content,
                user_name: user_name
            }),
            success: (data) => {
                if (data['message'] == 'success') {
                    submit_dialog.close();
                    mdui.snackbar('Submit success!');
                } else {
                    mdui.snackbar(data['error']);
                }
                $('#submit-enter-btn').text(submit_btn_text_origin);
            }
        })
    }
}

function tools_dialog_open_listener() {
    tools_dialog.open();
}