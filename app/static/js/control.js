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

async function send_post(url) {
    try {
        const response = await $.ajax({
            url: url,
            type: 'POST'
        });
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function init_language_select() {
    // Load saved language code from cookie.
    var save_lan_code = get_cookie('lancode');
    if (save_lan_code != "") {
        cur_lan_code = save_lan_code;
    }
    // Intialize the options in #language-select.
    var data = await get_data('fetch_lan');
    data.forEach(function (item) {
        var language_select_item = $(`
            <li lan-code="${item['code']}"><a class="dropdown-item">${item['name']}</a></li>
        `);

        $('#nav-language-select').append(language_select_item);
        switch_active_language(cur_lan_code);

        language_select_item.on('click', () => {
            var selected_lan_code = item['code'];
            if (cur_lan_code !== selected_lan_code) {
                cur_lan_code = selected_lan_code;
                set_cookie('lancode', cur_lan_code, 30);
                switch_active_language(cur_lan_code);

                action_sidebar_bs.hide();

                render_page_basic(cur_lan_code);
                render_class_tree(cur_lan_code);
                render_search_prompt_by_class(cur_selected_class, cur_lan_code);
            }
        });
    });
}

async function render_page_basic(selected_lan_code) {
    // Render the basic elements on the page.
    var data;

    data = await get_data(`fetch_index_contents/${selected_lan_code}/site`);
    $('#page-browser-title, #page-header-title').text(data['title']);
    $('#class-offcanvas-title').text(data['class_title']);
    $('#action-offcanvas-title').text(data['action_title']);

    data = await get_data(`fetch_index_contents/${selected_lan_code}/navbar`)
    $('#nav-submit-btn span').text(data['submit_btn']);

    data = await get_data(`fetch_index_contents/${selected_lan_code}/submit_dialog`);
    // Render contents in submit dialog.
    $('#submit-dialog-title').text(data['title']);
    $('#submit-dialog-message').text(data['message']);
    $('#submit-dialog-funcdesc-group input').attr('placeholder', data['func']);
    $('#submit-dialog-prompt-group textarea').attr('placeholder', data['prompt']);
    $('#submit-dialog-user-group input').attr('placeholder', data['user_name']);
    $('#submit-clear-btn').text(data['clear_btn_text']);
    $('#submit-enter-btn-text').text(data['ok_btn_text']);

    data = await get_data(`fetch_index_contents/${selected_lan_code}/tools_dialog`);
    $('#tools-btn').text(data['open_btn_text']);
    $('#tools-dialog .mdui-dialog-title').text(data['title']);

    data = await get_data(`fetch_index_contents/${selected_lan_code}/search`);
    $('#search-input-group input').attr('placeholder', data['prompt']);
    $('#search-input-group button').text(data['btn_text']);

    data = await get_data(`fetch_index_contents/${selected_lan_code}/cards`);
    $('#class-display-title').text(data['title']);

    data = await get_data(`fetch_banners/${selected_lan_code}`)
    $('#top-banner-inner').empty();
    $('#top-banner-indicator').empty();
    data.forEach(({image, url}, index) => {
        var banner_item = gen_top_banner_item(image, url);
        var indicator_item = $(`<button type="button" data-bs-target="#top-banner" data-bs-slide-to="${index}"></button>`);
        if (index === 0) {
            banner_item.addClass('active');
            indicator_item.addClass('active');
        }
        $('#top-banner-inner').append(banner_item);
        $('#top-banner-indicator').append(indicator_item);
    })
}

async function render_class_tree(selected_lan_code) {
    var saved_selected_class = get_cookie('selected_class');
    if (saved_selected_class !== "") {
        cur_selected_class = saved_selected_class;
    }

    // Intialize the options in #language-select.
    var data = await get_data(`fetch_classes/${selected_lan_code}`);
    $('#class-selection-list').empty();
    data.forEach((item, index) => {
        var class_selection = gen_class_selection(item);
        $('#class-selection-list').append(class_selection);
        if (item['childrens'] != undefined && item['childrens'].length) {
            $('#class-selection-list').append(gen_child_class_selection(item['childrens']));
        }
        if (index < data.length - 1) {
            $('#class-selection-list').append(`<hr class="class-selection-divider">`);
        }
    });

    $('.class-nav-link, .child-class-nav-link').on('click', (event) => {
        var clicked_class = $(event.target).attr('class-id');
        if (cur_selected_class !== clicked_class) {
            cur_selected_class = clicked_class;
            switch_active_class(cur_selected_class);

            render_search_prompt_by_class(cur_selected_class, cur_lan_code);
            class_sidebar_bs.hide();

            set_cookie('selected_class', cur_selected_class, 30);
        }
    })

    switch_active_class(cur_selected_class);
}

async function render_tools(selected_lan_code) {
    var data = await get_data(`fetch_tools/${selected_lan_code}`);
    $('#tools-dialog .mdui-dialog-content').html('');
    data.forEach((item) => {
        const card_html = gen_tool_card(item['name'], item['desc'],
            item['url'], item['tags'], item['icon_src']);
        $('#tools-dialog .mdui-dialog-content').append(`
                <div class="mdui-row">
                    ${card_html}
                </div>`);
    })
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

function switch_active_class(selected_class_id) {
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
        }
    });
}

// By Haomin Wen: display all prompts of a given class
async function render_search_prompt_by_class(class_id, selected_lan_code) {
    var data = await get_data(`fetch_prompt/${class_id}/${selected_lan_code}`)
    // use a function to handle the response data
    // call another function to render the fetched prompt data
    gen_prompt_display(data['content']);
}

// search prompt by give string
async function render_search_prompt_by_string(search_text, selected_lan_code) {
    var data = await get_data(`search_prompt/${search_text}/${selected_lan_code}`)
    gen_prompt_display(data['content']);
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

// click copy add
function add_search_prompt(lanCode, functionID, semanticID) {
    send_post(`increase_count/${lanCode}/${functionID}/${semanticID}`);
}