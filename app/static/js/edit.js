prompt_edit_dialog_bs = new bootstrap.Modal($('#prompt-edit-dialog'));

function gen_add_prompt_card() {
    if (cur_selected_class === 'popular' || cur_selected_class === 'user_fav') {
        return '';
    }
    var card = $(`
        <div class="prompt-col col">
            <div class="card shadow-sm text-bg-warning btn">
                <div class="card-body p-2">
                    <div class="card-text h6">
                        <i class="bi bi-file-earmark-plus"></i>
                        <div class="spinner-border spinner-border-sm d-none"></div>
                        <span class="ms-1">Add prompt</span>
                    </div>
                </div>
            </div>
        </div>
    `);

    card.on('click', () => {
        var edit_dialog = $('#prompt-edit-dialog');
        edit_dialog.find('input, textarea').val('');
        edit_dialog.find('input[content="lan-code"]').val(cur_lan_code);
        edit_dialog.find('input[content="function-id"]').addClass('d-none');
        edit_dialog.find('select[content="function-id"]').removeClass('d-none');
        edit_dialog.find('input[content="semantic-id"]').removeAttr('disabled', 'disabled');
        edit_dialog.find('input[content="lan-code"]').attr('disabled', 'disabled');
        edit_dialog.find('#example-edit-open-btn').addClass('disabled');
        edit_dialog.find('input[content="priority"]').val(0);

        card.find('.spinner-border').removeClass('d-none');
        card.find('.bi').addClass('d-none');

        send_post('fetch_functions_with_class', {
            'class_id': cur_selected_class,
            'lan_code': cur_lan_code
        }).then((data) => {
            edit_dialog.find('select[content="function-id"]').empty();
            data.content.forEach((item, index) => {
                edit_dialog.find('select[content="function-id"]').append(`
                    <option ${index ? '' : 'selected'} value="${item[0]}">${item[1]}</option>
                `);
            })

            card.find('.spinner-border').addClass('d-none');
            card.find('.bi').removeClass('d-none');
            prompt_edit_dialog_bs.show();
        })

        $('#prompt-edit-ok-btn').off('click', prompt_edit_ok_listener);
        $('#prompt-edit-ok-btn').on('click', prompt_add_ok_listener);
    })

    return card;
}

function prompt_card_hover_listener(event) {
    var target = $(event.target);
    var edit_btn = $(`
        <button class="btn position-absolute top-0 start-0 bg-warning m-2" id="prompt-edit-btn">
            <div class="spinner-border spinner-border-sm d-none"></div>
            <i class="bi bi-pencil-square"></i>
        </button>
    `);
    if (event.type == 'mouseenter') {
        target.append(edit_btn);
    } else {
        $('#prompt-edit-btn').remove();
    }

    edit_btn.on('click', (e) => {
        var edit_dialog = $('#prompt-edit-dialog');
        var prompt_card = $(e.target).parents('.prompt-card');
        edit_dialog.find('input, textarea').val('');
        $('#prompt-edit-btn .bi').addClass('d-none');
        $('#prompt-edit-btn .spinner-border').removeClass('d-none');

        var function_id = prompt_card.attr('function-id');
        var semantic_id = prompt_card.attr('semantic-id');
        var lan_code = prompt_card.attr('lan-code');
        edit_dialog.attr('function-id', function_id);
        edit_dialog.attr('semantic-id', semantic_id);
        edit_dialog.attr('lan-code', lan_code);

        edit_dialog.find(
            'input[content="function-id"], input[content="semantic-id"], input[content="lan-code"]'
        ).attr('disabled', 'disabled');
        edit_dialog.find('input[content="function-id"]').removeClass('d-none');
        edit_dialog.find('select[content="function-id"]').addClass('d-none');
        edit_dialog.find('#example-edit-open-btn').removeClass('disabled');

        send_post('fetch_prompt_meta', {
            'function_id': function_id,
            'semantic_id': semantic_id,
            'lan_code': lan_code
        }).then((data) => {
            $('#prompt-edit-btn .bi').removeClass('d-none');
            $('#prompt-edit-btn .spinner-border').addClass('d-none');

            var meta = data.meta;
            edit_dialog.find('input[content="function-id"]').val(meta.functionID);
            edit_dialog.find('input[content="semantic-id"]').val(meta.semanticID);
            edit_dialog.find('input[content="lan-code"]').val(meta.lanCode);
            edit_dialog.find('input[content="priority"]').val(meta.priority);
            edit_dialog.find('input[content="model"]').val(meta.model);
            edit_dialog.find('input[content="author"]').val(meta.author);
            edit_dialog.find('input[content="author-link"]').val(meta.author_link);
            edit_dialog.find('textarea[content="content"]').val(meta.content);

            prompt_edit_dialog_bs.show();
        });

        $('#prompt-edit-ok-btn').off('click', prompt_add_ok_listener);
        $('#prompt-edit-ok-btn').on('click', prompt_edit_ok_listener);
    })
}

function prompt_edit_dialog_resp_listener(data) {
    var edit_ok_btn = $('#prompt-edit-ok-btn');
    var edit_dialog = $('#prompt-edit-dialog');
    edit_ok_btn.find('.spinner-border').addClass('d-none');
    if (data.message === 'fail') {
        edit_dialog.find('label[content="error-message"]').text(data.error);
        edit_dialog.find('label[content="error-message"]').removeClass('d-none');
        setTimeout(() => {
            edit_dialog.find('label[content="error-message"]').addClass('d-none');
            edit_dialog.find('label[content="error-message"]').empty();
        }, 10000);
    } else {
        edit_ok_btn.find('.finished-indicator').removeClass('d-none');
        setTimeout(() => {
            edit_ok_btn.find('.finished-indicator').addClass('d-none');
            prompt_edit_dialog_bs.hide();
        }, 1000);
    }
}

function prompt_edit_ok_listener() {
    var edit_ok_btn = $('#prompt-edit-ok-btn');
    var edit_dialog = $('#prompt-edit-dialog');
    edit_ok_btn.find('.spinner-border').removeClass('d-none');
    send_post('edit_prompt_meta', {
        'function_id': edit_dialog.attr('function-id'),
        'semantic_id': edit_dialog.attr('semantic-id'),
        'lan_code': edit_dialog.attr('lan-code'),
        'function_id_new': edit_dialog.find('input[content="function-id"]').val(),
        'semantic_id_new': edit_dialog.find('input[content="semantic-id"]').val(),
        'lan_code_new': edit_dialog.find('input[content="lan-code"]').val(),
        'priority': edit_dialog.find('input[content="priority"]').val(),
        'model': edit_dialog.find('input[content="model"]').val(),
        'author': edit_dialog.find('input[content="author"]').val(),
        'author_link': edit_dialog.find('input[content="author-link"]').val(),
        'content': edit_dialog.find('textarea[content="content"]').val()
    }).then((data) => {
        prompt_edit_dialog_resp_listener(data);
    })
}

function prompt_add_ok_listener() {
    var edit_ok_btn = $('#prompt-edit-ok-btn');
    var edit_dialog = $('#prompt-edit-dialog');
    var semantic_id = validate_input(edit_dialog.find('input[content="semantic-id"]').parent());
    var content = validate_input(edit_dialog.find('textarea[content="content"]').parent());
    var priority = validate_input(edit_dialog.find('input[content="priority"]').parent());

    if (semantic_id.length > 0 && content.length > 0 && priority.length > 0) {
        edit_ok_btn.find('.spinner-border').removeClass('d-none');
        send_post('add_prompt', {
            'function_id': get_selected_value(edit_dialog.find('select[content="function-id"]')),
            'semantic_id': semantic_id,
            'lan_code': edit_dialog.find('input[content="lan-code"]').val(),
            'priority': priority,
            'model': edit_dialog.find('input[content="model"]').val(),
            'author': edit_dialog.find('input[content="author"]').val(),
            'author_link': edit_dialog.find('input[content="author-link"]').val(),
            'content': content
        }).then((data) => {
            prompt_edit_dialog_resp_listener(data);
        })
    }
}

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
        <li class="list-group-item p-1 border-0">
            <button class="btn w-100 btn-secondary">Add line</button>
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

$('#example-edit-open-btn').on('click', () => {
    var edit_dialog = $('#example-edit-dialog');
    var prompt_edit_dialog = $('#prompt-edit-dialog');
    edit_dialog.find('#example-model-edit-nav').empty();
    edit_dialog.find('#example-model-edit-tab-content').empty();

    send_post(`get_prompt_dialog`, {
        'function_id': prompt_edit_dialog.attr('function-id'),
        'semantic_id': prompt_edit_dialog.attr('semantic-id'),
        'lan_code': prompt_edit_dialog.attr('lan-code')
    }).then((data) => {
        // Add existing examples to the edit dialog.
        Object.entries(data.content).forEach(([model_name, dialog_contents], index) => {
            var [nav, tab_content] = gen_one_example_edit_tab(model_name, dialog_contents, index);
            edit_dialog.find('#example-model-edit-nav').append(nav);
            edit_dialog.find('#example-model-edit-tab-content').append(tab_content);
        });
    });
})

$('#example-add-dialog-btn').on('click', () => {
    // Add new example item to the edit dialog.
    var edit_dialog = $('#example-edit-dialog');
    var [nav, tab_content] = gen_one_example_edit_tab('',
        [{raw: $('#prompt-edit-dialog').find('textarea[content="content"]').val()}],
        edit_dialog.find('.example-nav-link').length);
    edit_dialog.find('#example-model-edit-nav').append(nav);
    edit_dialog.find('#example-model-edit-tab-content').append(tab_content);
})

$('#example-edit-ok-btn').on('click', () => {
    var edit_dialog = $('#example-edit-dialog');
    var prompt_edit_dialog = $('#prompt-edit-dialog');
    var examples = {};
    edit_dialog.find('#example-model-edit-nav .example-nav-link').each((i, nav_item) => {
        var model_name = $(nav_item).find('.model-name-input').val();
        var tab_id = $(nav_item).attr('data-bs-target');
        var example_contents = [];
        edit_dialog.find(tab_id).find('.example-list-item').each((j, list_item) => {
            var role_index = $(list_item).find('.role-icon .bi').hasClass('bi-person-fill') ? 0 : 1;
            var content = $(list_item).find('textarea').val();
            example_contents.push([j, content, role_index]);
        });
        examples[model_name] = example_contents;
    });
    $('#example-edit-ok-btn .spinner-border').removeClass('d-none');
    send_post('edit_prompt_dialog', {
        'function_id': prompt_edit_dialog.attr('function-id'),
        'semantic_id': prompt_edit_dialog.attr('semantic-id'),
        'lan_code': prompt_edit_dialog.attr('lan-code'),
        'examples': examples
    }).then((data) => {
        $('#example-edit-ok-btn .spinner-border').addClass('d-none');
        $('#example-edit-ok-btn .finished-indicator').removeClass('d-none');
        setTimeout(() => {
            $('#example-edit-ok-btn .finished-indicator').addClass('d-none');
        }, 2000);
    })
})