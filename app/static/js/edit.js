const prompt_edit_dialog_bs = new bootstrap.Modal($('#prompt-edit-dialog'));
var prompt_edit_role = 'edit';
const example_edit_dialog = $('#example-edit-dialog');
const prompt_edit_dialog = $('#prompt-edit-dialog');
const prompt_edit_ok_btn = $('#prompt-edit-ok-btn');
const example_edit_ok_btn = $('#example-edit-ok-btn');
const prompt_delete_btn = $('#prompt-delete-btn');
new bootstrap.Tooltip($('#prompt-delete-btn'));

var prompt_delete_click_timer;
var prompt_delete_click_count = 0;

// Generate a "Add prompt" card for adding new prompts.
function gen_add_prompt_card() {
    if (cur_selected_class === 'popular' || cur_selected_class === 'user_fav' || cur_selected_class === '') {
        return '';
    }
    var card = $(`
        <div class="prompt-col col">
            <div class="card shadow-sm text-bg-warning btn">
                <div class="card-body p-1">
                    <div class="card-text h6">
                        <i class="bi bi-file-earmark-plus"></i>
                        <span class="ms-1">Add prompt</span>
                    </div>
                </div>
            </div>
        </div>
    `);

    card.on('click', () => {
        prompt_edit_role = 'add';
        var edit_dialog = $('#prompt-edit-dialog');
        edit_dialog.removeAttr('function-id');
        edit_dialog.removeAttr('semantic-id');
        edit_dialog.removeAttr('lan-code');
        edit_dialog.find('input, textarea').val('');
        edit_dialog.find('select').empty();
        edit_dialog.find('input[content="lan-code"]').val(cur_lan_code);
        edit_dialog.find('input[content="semantic-id"]').removeAttr('disabled');
        edit_dialog.find('input[content="lan-code"]').attr('disabled', 'disabled');
        edit_dialog.find('#example-edit-open-btn').addClass('disabled');
        edit_dialog.find('input[content="priority"]').val(0);
        edit_dialog.find('#prompt-edit-ok-btn, #example-edit-open-btn').addClass('disabled');
        prompt_edit_dialog_bs.show();

        send_post('fetch_functions_with_class', {
            'class_id': cur_selected_class,
            'lan_code': cur_lan_code
        }).then((data) => {
            data.content.forEach((item, index) => {
                edit_dialog.find('select[content="function-id"]').append(`
                    <option ${index ? '' : 'selected'} value="${item[0]}">${item[1]}</option>
                `);
            });
            edit_dialog.find('#prompt-edit-ok-btn').removeClass('disabled');
        })
    })

    return card;
}

// Generate a top-right button for edit prompts.
function gen_prompt_card_edit_btn() {
    var edit_btn = $(`
        <button class="btn badge position-absolute top-0 end-0 m-1 prompt-edit-btn text-bg-warning">
            <i class="bi bi-pencil-square"></i>
        </button>
    `);

    edit_btn.on('click', (e) => {
        prompt_edit_role = 'edit';
        var edit_dialog = $('#prompt-edit-dialog');
        var prompt_card = $(e.target).parents('.prompt-card');
        edit_dialog.find('input, textarea').val('');
        edit_dialog.find('select').empty();

        var function_id = prompt_card.attr('function-id');
        var semantic_id = prompt_card.attr('semantic-id');
        var lan_code = prompt_card.attr('lan-code');
        edit_dialog.attr('function-id', function_id);
        edit_dialog.attr('semantic-id', semantic_id);
        edit_dialog.attr('lan-code', lan_code);

        edit_dialog.find('input[content="lan-code"]').attr('disabled', 'disabled');
        edit_dialog.find('#example-edit-open-btn').removeClass('disabled');
        edit_dialog.find('#prompt-edit-ok-btn, #example-edit-open-btn').addClass('disabled');
        prompt_edit_dialog_bs.show();

        Promise.all([
            send_post('fetch_prompt_meta', {
                'function_id': function_id,
                'semantic_id': semantic_id,
                'lan_code': lan_code
            }),
            send_post('fetch_functions_with_class', {
                'class_id': cur_selected_class,
                'lan_code': lan_code
            })
        ]).then(([prompt_meta, functions]) => {
            var meta = prompt_meta.meta;

            edit_dialog.find('input[content="semantic-id"]').val(meta.semanticID);
            edit_dialog.find('input[content="lan-code"]').val(meta.lanCode);
            edit_dialog.find('input[content="priority"]').val(meta.priority);
            edit_dialog.find('input[content="model"]').val(meta.model);
            edit_dialog.find('input[content="author"]').val(meta.author);
            edit_dialog.find('input[content="author-link"]').val(meta.author_link);
            edit_dialog.find('textarea[content="content"]').val(meta.content);

            if (cur_selected_class === 'popular' || cur_selected_class === 'user_fav' || cur_selected_class === '') {
                edit_dialog.find('select[content="function-id"]').append(`
                    <option selected value="${meta.functionID}">${meta.functionID}</option>
                `);
            } else {
                functions.content.forEach((item) => {
                    edit_dialog.find('select[content="function-id"]').append(`
                        <option ${meta.functionID === item[0] ? 'selected' : ''} value="${item[0]}">${item[1]}</option>
                    `);
                });
            }
            edit_dialog.find('#prompt-edit-ok-btn, #example-edit-open-btn').removeClass('disabled');
        });
    });

    return edit_btn
}

// Click listener for the OK button in prompt edit dialog.
prompt_edit_ok_btn.on('click', () => {
    if (prompt_edit_role === 'edit') {
        prompt_edit_submit_listener();
    } else if (prompt_edit_role === 'add') {
        prompt_add_submit_listener();
    }
});

// Submit listener for edit prompt.
function prompt_edit_submit_listener() {
    loading_state_btn(prompt_edit_ok_btn);

    var function_id = prompt_edit_dialog.attr('function-id');
    var semantic_id = prompt_edit_dialog.attr('semantic-id');
    var lan_code = prompt_edit_dialog.attr('lan-code');
    var function_id_new = get_selected_value(prompt_edit_dialog.find('select[content="function-id"]'));
    var semantic_id_new = prompt_edit_dialog.find('input[content="semantic-id"]').val();
    var lan_code_new = prompt_edit_dialog.find('input[content="lan-code"]').val();
    send_post('edit_prompt_meta', {
        'function_id': function_id,
        'semantic_id': semantic_id,
        'lan_code': lan_code,
        'function_id_new': function_id_new,
        'semantic_id_new': semantic_id_new,
        'lan_code_new': lan_code_new,
        'priority': prompt_edit_dialog.find('input[content="priority"]').val(),
        'model': prompt_edit_dialog.find('input[content="model"]').val(),
        'author': prompt_edit_dialog.find('input[content="author"]').val(),
        'author_link': prompt_edit_dialog.find('input[content="author-link"]').val(),
        'content': prompt_edit_dialog.find('textarea[content="content"]').val()
    }).then((data) => {
        prompt_edit_dialog_resp_listener(data, function_id_new, semantic_id_new, lan_code_new);
    })
}

// Submit listener for add prompt.
function prompt_add_submit_listener() {
    var function_id = get_selected_value(prompt_edit_dialog.find('select[content="function-id"]'));
    var semantic_id = validate_input(prompt_edit_dialog.find('input[content="semantic-id"]').parent());
    var lan_code = prompt_edit_dialog.find('input[content="lan-code"]').val();
    var content = validate_input(prompt_edit_dialog.find('textarea[content="content"]').parent());
    var priority = validate_input(prompt_edit_dialog.find('input[content="priority"]').parent());

    if (semantic_id.length > 0 && content.length > 0 && priority.length > 0) {
        loading_state_btn(prompt_edit_ok_btn);
        send_post('add_prompt', {
            'function_id': function_id,
            'semantic_id': semantic_id,
            'lan_code': lan_code,
            'priority': priority,
            'model': prompt_edit_dialog.find('input[content="model"]').val(),
            'author': prompt_edit_dialog.find('input[content="author"]').val(),
            'author_link': prompt_edit_dialog.find('input[content="author-link"]').val(),
            'content': content
        }).then((data) => {
            prompt_edit_dialog_resp_listener(data, function_id, semantic_id, lan_code);
        })
    }
}

// Response listener on finishing submit prompt add/edit.
function prompt_edit_dialog_resp_listener(data, function_id, semantic_id, lan_code) {
    finished_state_btn(prompt_edit_ok_btn);
    if (data.message === 'fail') {
        show_error_message(prompt_edit_dialog, data.error);
    } else {
        prompt_edit_dialog.attr('function-id', function_id);
        prompt_edit_dialog.attr('semantic-id', semantic_id);
        prompt_edit_dialog.attr('lan-code', lan_code);
        prompt_edit_dialog.find('#example-edit-open-btn').removeClass('disabled');
    }
}

// Click listener for the Delete button in prompt edit dialog.
prompt_delete_btn.on('click', () => {
    clearTimeout(prompt_delete_click_timer);
    prompt_delete_click_count++;
    if (prompt_delete_click_count === 3) {
        prompt_delete_click_count = 0;
        var function_id = prompt_edit_dialog.attr('function-id');
        var semantic_id = prompt_edit_dialog.attr('semantic-id');
        var lan_code = prompt_edit_dialog.attr('lan-code');
        send_post('remove_prompt', {
            'function_id': function_id,
            'semantic_id': semantic_id,
            'lan_code': lan_code
        }).then((data) => {
            if (data.message === 'fail') {
                show_error_message(prompt_edit_dialog, data.error);
            } else {
                prompt_edit_dialog_bs.hide();
            }
        })
    } else {
        prompt_delete_click_timer = setTimeout(() => {
            prompt_delete_click_count = 0;
        }, 200);
    }
})

// Generate the edit list for one example.
function gen_one_example_edit_list(dialog_contents) {
    const icons = ['person-fill', 'gear-wide'];
    var dialog_list = $(`<ul class="list-group list-group-flush rounded">`);

    const _get_list_item = (content, role) => {
        var item = $(`
            <li class="list-group-item d-flex flex-column example-list-item p-1 border-0">
                <div class="input-group">
                    <div class="input-group-text text-dark px-1">
                        <i class="bi bi-grip-vertical"></i>
                    </div>
                    <button class="input-group-text role-icon">
                        <i class="bi bi-${icons[role]}"></i>
                    </button>
                    <textarea class="form-control form-control-sm" rows="4">${content}</textarea>
                    <button class="input-group-text dialog-list-remove-btn text-danger">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </li>
        `);
        item.find('.role-icon').on('click', (event) => {
            $(event.target).find('.bi').toggleClass(`bi-${icons[0]} bi-${icons[1]}`);
        });
        item.find('.dialog-list-remove-btn').on('click', () => {
            item.remove();
        })
        return item;
    }

    var add_item_btn = $(`
        <li class="list-group-item p-1 border-0" id="add-item-btn">
            <button class="btn w-100 btn-light btn-sm border-secondary">Add line</button>
        </li>
    `);
    dialog_list.append(add_item_btn);
    add_item_btn.on('click', () => {
        dialog_list.append(_get_list_item('', dialog_list.find('.example-list-item').length % 2));
        dialog_list.sortable();
    })

    dialog_contents.forEach((content, index) => {
        var role = (content.role === null || content.role === undefined) ? (index % 2) : content.role;
        var dialog_item = _get_list_item(content.raw, role);
        var copy_btn = dialog_item.find('.dialog-copy-btn');
        copy_btn.on('click', () => { copy_btn_click_listener(copy_btn, content.raw); });

        dialog_list.append(dialog_item);
    });

    dialog_list.sortable();

    return dialog_list;
}

// Generate a pair of nav link and tab content for one example.
function gen_one_example_edit_tab(model_name, dialog_contents, index) {
    var nav = $(`
        <li class="nav-item">
            <a class="nav-link example-nav-link d-flex flex-nowrap align-items-center ${(index === 0) ? 'active' : ''}"
            data-bs-toggle="tab" data-bs-target="#example-edit-model-${index}">
                <button class="btn badge text-danger dialog-tab-remove-btn">
                    <i class="bi bi-x-lg"></i>
                </button>
                <input class="form-control form-control-sm model-name-input" 
                value="${model_name}" type="text" placeholder="model name" style="width: 100px"/>
            </a>
        </li>
    `);

    var tab_content = $(`
        <div class="tab-pane fade ${(index === 0) ? 'active show' : ''}" tabindex="1" 
        id="example-edit-model-${index}">
    `);
    tab_content.append(gen_one_example_edit_list(dialog_contents));

    nav.find('.dialog-tab-remove-btn').on('click', () => {
        nav.remove();
        tab_content.remove();
    })

    return [nav, tab_content];
}

// Click listener for the 'Edit example' button in prompt edit dialog.
// Render example editor with existing examples.
example_edit_count_pointer = 0;
$('#example-edit-open-btn').on('click', () => {
    example_edit_dialog.find('#example-model-edit-nav').empty();
    example_edit_dialog.find('#example-model-edit-tab-content').empty();
    example_edit_dialog.find('#example-add-dialog-btn, #example-edit-ok-btn').addClass('disabled');

    send_post(`get_prompt_dialog`, {
        'function_id': prompt_edit_dialog.attr('function-id'),
        'semantic_id': prompt_edit_dialog.attr('semantic-id'),
        'lan_code': prompt_edit_dialog.attr('lan-code')
    }).then((data) => {
        // Add existing examples to the edit dialog.
        example_edit_count_pointer = Object.keys(data.content).length;
        Object.entries(data.content).forEach(([model_name, dialog_contents], index) => {
            var [nav, tab_content] = gen_one_example_edit_tab(model_name, dialog_contents, index);
            example_edit_dialog.find('#example-model-edit-nav').append(nav);
            example_edit_dialog.find('#example-model-edit-tab-content').append(tab_content);
        });
        example_edit_dialog.find('#example-add-dialog-btn, #example-edit-ok-btn').removeClass('disabled');
    });
})

// Click listener for the 'Add dialog' button in example edit dialog.
$('#example-add-dialog-btn').on('click', () => {
    // Add new example item to the edit dialog.
    var [nav, tab_content] = gen_one_example_edit_tab('',
        [{ raw: $('#prompt-edit-dialog').find('textarea[content="content"]').val() }],
        example_edit_count_pointer++);
    example_edit_dialog.find('#example-model-edit-nav').append(nav);
    example_edit_dialog.find('#example-model-edit-tab-content').append(tab_content);
})

// Click listener for the OK button in example edit dialog.
example_edit_ok_btn.on('click', () => {
    var examples = {};
    var has_empty = false;
    example_edit_dialog.find('#example-model-edit-nav .example-nav-link').each((i, nav_item) => {
        var model_name = validate_input($(nav_item));
        if (model_name.length === 0) {
            has_empty = true;
        }
        var tab_id = $(nav_item).attr('data-bs-target');
        var example_contents = [];
        example_edit_dialog.find(tab_id).find('.example-list-item').each((j, list_item) => {
            var role_index = $(list_item).find('.role-icon .bi').hasClass('bi-person-fill') ? 0 : 1;
            var content = $(list_item).find('textarea').val();
            example_contents.push([j, content, role_index]);
        });
        examples[model_name] = example_contents;
    });
    if (!has_empty) {
        loading_state_btn(example_edit_ok_btn);
        send_post('edit_prompt_examples', {
            'function_id': prompt_edit_dialog.attr('function-id'),
            'semantic_id': prompt_edit_dialog.attr('semantic-id'),
            'lan_code': prompt_edit_dialog.attr('lan-code'),
            'examples': examples
        }).then((data) => {
            finished_state_btn(example_edit_ok_btn);
            if (data.message === 'fail') {
                show_error_message(example_edit_dialog, data.error);
            }
        })
    }
})