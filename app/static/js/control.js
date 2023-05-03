/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Control functions.
 */

// const { CONNREFUSED } = require("dns");

function set_cookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function get_cookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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

function render_page_basic(selected_lan_code) {
    // Render the basic elements on the page.
    get_data(`fetch_index_contents/${selected_lan_code}/site`).then(data => {
        $('#page-browser-title, #page-header-title').text(data['title']);
    })
    get_data(`fetch_index_contents/${selected_lan_code}/submit_dialog`).then(data => {
        // Render contents in submit dialog.
        $('#submit-dialog-title').text(data['title']);
        $('#submit-dialog-message').text(data['message']);
        $('#submit-dialog-funcdesc-tf label').text(data['func']);
        $('#submit-dialog-prompt-tf label').text(data['prompt']);
        $('#submit-dialog-username-tf label').text(data['user_name']);
        $('#submit-enter-btn').text(data['ok_btn_text']);
        $('#submit-cancel-btn').text(data['cancel_btn_text']);
    })
    get_data(`fetch_index_contents/${selected_lan_code}/tools_dialog`).then(data => {
        // Render contents in tools dialog.
        $('#tools-btn').text(data['open_btn_text']);
        $('#tools-dialog .mdui-dialog-title').text(data['title']);
    })
    get_data(`fetch_index_contents/${selected_lan_code}/search`).then(data => {
        $('#search-input').attr('placeholder', data['prompt']);
        $('#search-btn').text(data['btn_text']);
    })
    get_data(`fetch_index_contents/${selected_lan_code}/cards`).then(data => {
        $('#class-display-title').text(data['title']);
    })
    get_data(`fetch_index_contents/${selected_lan_code}/input`).then(data => {
        $('.mdui-textfield-error').text(data['error_info']);
    })
}

function render_tools(selected_lan_code) {
    get_data(`fetch_tools/${selected_lan_code}`).then(data => {
        $('#tools-dialog .mdui-dialog-content').html('');
        data.forEach((item) => {
            const card_html = gen_tool_card(item['name'], item['desc'],
                item['url'], item['tags'], item['icon_src']);
            $('#tools-dialog .mdui-dialog-content').append(`
                <div class="mdui-row">
                    ${card_html}
                </div>`);
        })
    })
}

function render_class_display(selected_lan_code) {
    // Render the display of all classes.
    get_data('fetch_class/with_example').then(data => {
        $('#class-card-row').text("");
        let classes = data['content'];
        classes.forEach(function (item) {
            class_card_html = gen_class_card_html(item['id'],
                item['names'][selected_lan_code],
                item['example']['desc'][selected_lan_code]);
            $('#class-card-row').append(class_card_html);
        })
    })
}

function init_language_select() {
    // Load saved language code from cookie.
    var save_lan_code = get_cookie('lancode');
    if (save_lan_code != "") {
        cur_lan_code = save_lan_code;
    }
    // Intialize the options in #language-select.
    get_data('fetch_lan').then(data => {
        data.forEach(function (item) {
            let lan_code = item['code'];
            let lan_display = item['name'];
            $('#language-select').append(`<option value=${lan_code}>${lan_display}</option>`);
            switch_selected_language(cur_lan_code);
        })
    })
}

function switch_selected_language(selected_lan_code) {
    // Change the selected option of #language-select to the given lan_code.
    $('#language-select option').each(function () {
        if ($(this).val() == selected_lan_code) {
            $(this).attr("selected", "selected");
        }
        else {
            $(this).removeAttr("selected");
        }
    });
}

function validate_textarea(tf_id) {
    var input_val = $(`#${tf_id} textarea`).val();
    if (input_val.length > 0) {
        $(`#${tf_id}`).removeClass('mdui-textfield-invalid');
    } else {
        $(`#${tf_id}`).addClass('mdui-textfield-invalid');
    }
    return input_val;
}

function render_class_tree(selected_lan_code) {
    // Intialize the options in #language-select.
    get_data(`fetch_classes/${selected_lan_code}`).then(data => {
        $('#hierarchy-tree').empty();
        render_hierarchy_tree(data, $('#hierarchy-tree'));
    })
}

// By Haomin Wen: display all prompts of a given class
async function render_search_prompt_by_class(class_id, selected_lan_code) {
    var data = await get_data(`fetch_prompt/${class_id}/${selected_lan_code}`)
    // use a function to handle the response data
    // call another function to render the fetched prompt data
    render_prompt_display(data['content']);
}

// display all prompts
function render_all_prompt(selected_lan_code) {
    get_data(`fetch_prompt/all_class/${selected_lan_code}`).then(data => {
        render_prompt_display(data['content']);
    })
}

// search prompt by give string
function render_search_prompt_by_string(search_text, selected_lan_code) {
    get_data(`search_prompt/${search_text}/${selected_lan_code}`).then(data => {
        render_prompt_display(data['content']);
    })
}

// render given prompts
function render_prompt_display(prompt_list) {
    $('#class-card-row').empty();
    $('#prompt_num').text("Prompt Number:" + prompt_list.length.toString());
    prompt_list.forEach((item, index) => {
        prompt_card_html = generate_prompt_card_html(index, item);
        $('#class-card-row').append(prompt_card_html);
    });
    $('.copy-prompt-btn').on('click', (e) => {
        const prompt_content = $(e.target).parents('.prompt-card').find('.prompt-card-content').text();
        copy_to_clipboard(prompt_content);
        $(e.target).text('copied');
        setTimeout(() => {
            $(e.target).text('copy');
        }, 1500);
    })
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
