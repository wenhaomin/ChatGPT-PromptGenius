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

function render_page_basic(selected_lan_code) {
    // Render the basic elements on the page.
    $.ajax({
        type: 'GET',
        url: 'fetch_meta/index_content',
        contentType: 'application/json',
        success: function (data) {
            let index_content = data['content'][selected_lan_code];
            console.log(index_content);

            $('#page-browser-title, #page-header-title').text(index_content['site_title']);
            $('#search-input').attr('placeholder', index_content['search_prompt']);
            $('#search-btn').text(index_content['search_btn_text']);
            $('#class-display-title').text(index_content['class_display_title']);

            // Render contents in submit dialog.
            $('#submit-dialog-title').text(index_content['submit_dialog']['title']);
            $('#submit-dialog-message').text(index_content['submit_dialog']['message']);
            $('#submit-dialog-funcdesc-label').text(index_content['submit_dialog']['func_desc']);
            $('#submit-dialog-prompt-label').text(index_content['submit_dialog']['prompt']);
            $('#submit-dialog-username-label').text(index_content['submit_dialog']['user_name']);
            $('#submit-enter-btn').text(index_content['submit_dialog']['submit_btn']);
            $('#submit-cancel-btn').text(index_content['submit_dialog']['cancel_btn']);
            mdui.mutation();
        }
    })
}

function render_class_display(selected_lan_code) {
    // Render the display of all classes.
    $.ajax({
        type: 'GET',
        url: 'fetch_class/with_example',
        contentType: 'application/json',
        // When the AJAX call is successful, the response data is passed to the success callback function as the data parameter.
        success: function (data) {
            $('#class-card-row').text("");
            let classes = data['content'];
            classes.forEach(function (item) {
                class_card_html = gen_class_card_html(item['id'],
                    item['names'][selected_lan_code],
                    item['example']['desc'][selected_lan_code]);
                // console.log('item:',item)
                $('#class-card-row').append(class_card_html);
            })
        }
    })
}



function init_language_select() {
    // Load saved language code from cookie.
    var save_lan_code = get_cookie('lancode');
    if (save_lan_code != "") {
        cur_lan_code = save_lan_code;
    }
    // Intialize the options in #language-select.
    $.ajax({
        type: 'GET',
        url: 'fetch_meta/languages',
        contentType: 'application/json',
        success: function (data) {
            all_languages = data["content"];
            all_languages.forEach(function (item) {
                let lan_code = item['code'];
                let lan_display = item['name'];
                $('#language-select').append(`<option value=${lan_code}>${lan_display}</option>`);
                switch_selected_language(cur_lan_code);
            })
        }
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



// function render_hierarchy_tree(data, parent_element, selected_lan_code) {
//     data.forEach(function (item) {
//         // Create a new MDUI Collapse item
//         var collapseItem = $('<div class="mdui-collapse-item mdui-collapse-item-close"></div>');
//
//         head_name = item['names'][selected_lan_code];
//         is_has_children = (item.children && item.children.length);
//         class_id = item.id;
//
//         icon_style = item['icon_style'] || '';
//         icon_name = item['icon_name'] || 'none';
//
//
//         header_html = `
//             <div class="mdui-collapse-item-header mdui-list-item mdui-ripple">
//         `;
//
//         // icon
//         if ((icon_name != 'none') ){
//             icon_html = `<i class="${icon_style}">${icon_name}</i>`
//             header_html += icon_html;
//         }
//
//         // content
//         header_html += `<div class="mdui-list-item-content">${head_name}</div>`
//
//         // arrow
//         if (is_has_children) {
//             header_html_arrow = `
//                     <i class="mdui-collapse-item-arrow mdui-icon material-icons mdui-">keyboard_arrow_down</i>
//                 </div>
//             `;
//             header_html += header_html_arrow;
//         }
//         header_html +=  `</div>`
//
//         var header = $(header_html)
//             .attr('data-title', class_id)
//             .on('click', function() {
//
//                 // Prevent the click event from propagating to child elements
//                 // event.stopPropagation();
//                 // Custom click event listener code
//
//                 console.log('Clicked on item with id:', class_id);
//                 cur_class = class_id;
//                 render_search_prompt_by_class(item.id, cur_lan_code)
//             });
//
//
//         // Append the header to the Collapse item
//         collapseItem.append(header);
//
//         // Check if the current item has children
//         if (is_has_children) {
//             // Create a new MDUI Collapse item body
//             var body = $('<div class="mdui-collapse-item-body mdui-list mdui-list-dense"></div>');
//
//             // Recursively call the 'renderHierarchyTree' function to render the child items
//             render_hierarchy_tree(item.children, body, selected_lan_code);
//
//             // Append the body to the Collapse item
//             collapseItem.append(body);
//         }
//
//         // Append the MDUI Collapse item to the parent element
//         parent_element.append(collapseItem);
//     });
// }


function render_hierarchy_tree(data, parent_element, selected_lan_code) {
    data.forEach(function (item) {
        // Wrap the loop body with an IIFE to create a new scope for each iteration
        (function (item) {
            // Create a new MDUI Collapse item
            var collapseItem = $('<div class="mdui-collapse-item mdui-collapse-item-close"></div>');

            var head_name = item['names'][selected_lan_code];
            var is_has_children = (item.children && item.children.length);
            var class_id = item.id;

            var icon_style = item['icon_style'] || '';
            var icon_name = item['icon_name'] || 'none';

            var header_html = `
          <div class="mdui-collapse-item-header mdui-list-item mdui-ripple">
      `;

            // icon
            if ((icon_name != 'none')) {
                var icon_html = `<i class="${icon_style}">${icon_name}</i>`;
                header_html += icon_html;
            }

            // content
            header_html += `<div class="mdui-list-item-content">${head_name}</div>`;

            // arrow
            if (is_has_children) {
                var header_html_arrow = `
                <i class="mdui-collapse-item-arrow mdui-icon material-icons mdui-">keyboard_arrow_down</i>
              </div>
          `;
                header_html += header_html_arrow;
            }
            header_html += `</div>`;

            var header = $(header_html)
                .attr('data-title', class_id)
                .on('click', function () {
                    // Custom click event listener code
                    console.log('Clicked on item with id:', class_id);
                    cur_class = class_id;
                    render_search_prompt_by_class(item.id, cur_lan_code);
                });

            // Append the header to the Collapse item
            collapseItem.append(header);

            // Check if the current item has children
            if (is_has_children) {
                // Create a new MDUI Collapse item body
                var body = $('<div class="mdui-collapse-item-body mdui-list mdui-list-dense"></div>');

                // Recursively call the 'renderHierarchyTree' function to render the child items
                render_hierarchy_tree(item.children, body, selected_lan_code);

                // Append the body to the Collapse item
                collapseItem.append(body);
            }

            // Append the MDUI Collapse item to the parent element
            parent_element.append(collapseItem);
        })(item); // Pass the 'item' variable as an argument to the IIFE
    });
}




function render_class_tree(selected_lan_code) {
    // Intialize the options in #language-select.
    $.ajax({
        type: 'GET',
        url: 'fetch_tree/',
        contentType: 'application/json',
        success: function (data) {
            // console.log('tree data', data)
            $('#hierarchy-tree').empty();
            render_hierarchy_tree(data['content'], $('#hierarchy-tree'), selected_lan_code);
        }
    })
}

// By Haomin Wen: display all prompts of a given class
function render_search_prompt_by_class(class_id, selected_lan_code) {
    $.ajax({
        type: 'GET',
        url: 'fetch_prompt/' + class_id + '/' + selected_lan_code,
        contentType: 'application/json',
        success: function (data) { // use a function to handle the response data
            // call another function to render the fetched prompt data
            render_prompt_display(data['content']);
        }
    });
}

// display all prompts
function render_all_prompt(selected_lan_code) {
    $.ajax({
        type: 'GET',
        url: 'fetch_prompt/' + "all_class" + '/' + selected_lan_code,
        contentType: 'application/json',
        success: function (data) {
            render_prompt_display(data['content']);
        }
    });
}

// search prompt by give string
function render_search_prompt_by_string(search_text, selected_lan_code) {
    $.ajax({
        type: 'GET',
        url: 'search_prompt/' + search_text + '/' + selected_lan_code,
        contentType: 'application/json',
        success: function (data) {
            render_prompt_display(data['content']);
        }
    });
}

// render given prompts
function render_prompt_display(prompt_list) {
    $('#class-card-row').empty();
    $('#prompt_num').text("Prompt Number:" + prompt_list.length.toString());
    console.log(prompt_list.length)
    prompt_list.forEach(function (item, index) {

        prompt_card_html = generate_prompt_card_html(index, item);
        $('#class-card-row').append(prompt_card_html);

        cur_copy_button = '#copy-message-' + index.toString();
        $(cur_copy_button).on('click', function () {

            // copy
            const cur_prompt = document.getElementById('class-card-' + index.toString());
            copy_to_clipboard($(cur_prompt).text());

            // show the copy information
            const copy_message = document.getElementById('copy-message-' + index.toString());
            copy_message.textContent = 'copied'
            setTimeout(function () {
                copy_message.textContent = 'copy'
            }, 1500);

        });

    })
}
//The # symbol is used in jQuery for selecting an element by its ID, but when using document.getElementById, you should only pass the ID string without the # symbol.

// copy text
function copy_to_clipboard(text) {
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Content copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    copyContent();
}

function clear_submit_dialog_input() {
    $('#submit-dialog-funcdesc-input').val("");
    $('#submit-dialog-prompt-input').val("");
    $('#submit-dialog-username-input').val("");
}
