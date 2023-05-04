function gen_class_card_html(class_id, class_name, example_desc) {
    html = `
    <div class="mdui-col class-card-col">
        <div class="mdui-card class-card mdui-hoverable" id="class-card-${class_id}" classid="${class_id}">
            <div class="mdui-card-primary class-card-primary">
                <div class="mdui-card-primary-title">${class_name}</div>
            </div>
            <div class="mdui-card-content">${example_desc}</div>
        </div>
    </div>
    `
    return html
}

function gen_tool_card(tool_name, tool_desc, tool_url, tags, icon_src) {
    let tag_html = []
    tags.forEach(tag => {
        tag_html.push(`<div class="mdui-chip mdui-color-grey-300">
            <span class="mdui-chip-title">${tag}</span>
        </div>`);
    });
    tag_html = tag_html.join('\n');
    html = `
    <a href="${tool_url}" target="_blank" style="text-decoration: none;">
        <div class="mdui-card mdui-hoverable mdui-color-grey-200 mdui-m-b-2">
            <div class="mdui-card-primary">
                <div class="mdui-row mdui-p-x-2">
                <span class="mdui-typo-title mdui-m-r-1">${tool_name}</span>
                ${tag_html}
                <img class="mdui-chip-icon mdui-float-right" src="${icon_src}"/>
                </div>
                <div class="mdui-card-content">${tool_desc}</div>
            </div>
        </div>
    </a>
    `;
    return html;
}

function generate_prompt_card_html(index, item) {
    chat_list = item['chat_list']
    class_list = item['class_list']
    author = item['author']
    author_link = item['author_link']
    model = item['model']
    function_desc = item['function_desc']
    prompt_text = chat_list[0]
    class_name = class_list[0]
    icon_name = item['icon_name']
    icon_style = item['icon_style']
    example_desc = prompt_text

    icon_html = `<span class="${icon_style} mdui-m-r-1">${icon_name}</span>`

    html = `
    <div class="mdui-col-xs-12 mdui-col-sm-12 mdui-col-md-12 mdui-col-lg-12 mdui-col-xl-12 mdui-m-t-12 mdui-m-b-2">
      <div class="mdui-card mdui-shadow-4 prompt-card">
        <div class="mdui-card-primary mdui-color-grey-50 prompt-card-header">
          ${icon_html}
          <span class="mdui-chip mdui-color-theme-200">
            <div class="mdui-chip-title">${class_name}</div>
          </span>
          <span class="mdui-chip mdui-color-theme-400">
              <div class="mdui-chip-title ">${function_desc}</div>
          </span>
          <span class="mdui-chip mdui-color-grey-50">
            <a href="${author_link}" target="_blank"> 
            <div class="mdui-chip-title mdui-text-color-theme-text">${author}</div>
            </a>
          </span>
          <button class="mdui-btn mdui-float-right copy-prompt-btn">copy</button>
        </div>
        <div class="mdui-card-primary mdui-p-a-0">    
          <div class="mdui-card-content mdui-text-color-theme-text prompt-card-content"> ${prompt_text} </div>
        </div>
        </div>
      </div>
    </div>
  `
    return html;
}

function render_hierarchy_tree(data, parent_element) {
    data.forEach((item) => {
        // Wrap the loop body with an IIFE to create a new scope for each iteration
        ((item) => {
            // Create a new MDUI Collapse item
            var is_has_children = (item['childrens'] != undefined && item['childrens'].length);

            var collapseItem = $('<li class="mdui-list-item mdui-ripple"></li>');
            if (is_has_children) {
                collapseItem = $('<li class="mdui-collapse-item mdui-collapse-item-close"></li>');
            }

            var head_name = item['name'];
            var class_id = item['ID'];

            var icon_style = '';
            var icon_name = 'none';
            if (item['icon'] != undefined) {
                icon_style = item['icon_style'];
                icon_name = item['icon'];
            }

            var header_html = '';
            if (is_has_children) {
                header_html = `<div class="mdui-collapse-item-header mdui-list-item mdui-ripple">`;
            }

            // icon
            if ((icon_name != 'none')) {
                var icon_html = `<i class="${icon_style}">${icon_name}</i>`;
                header_html += icon_html;
            }

            // content
            header_html += `<div class="mdui-list-item-content mdui-text-truncate hierarchy-tree-content">${head_name}</div>`;
            // arrow
            if (is_has_children) {
                var header_html_arrow = `
                    <i class="mdui-collapse-item-arrow mdui-icon material-icons mdui-">keyboard_arrow_down</i>
                    </div>`;
                header_html += header_html_arrow;
                header_html += `</div>`;
            }

            var header = $(header_html)
                .attr('data-title', class_id)
                .on('click', () => {
                    // Custom click event listener code
                    cur_class = class_id;
                    $('#main-bar').switchClass('normal-bar', 'loading-bar', 500);
                    render_search_prompt_by_class(item['ID'], cur_lan_code).then(() => {
                        $('#main-bar').switchClass('loading-bar', 'normal-bar', 500);
                    });
                });

            // Append the header to the Collapse item
            collapseItem.append(header);

            // Check if the current item has children
            if (is_has_children) {
                // Create a new MDUI Collapse item body
                var body = $('<ul class="mdui-collapse-item-body mdui-list mdui-list-dense"></ul>');
                // Recursively call the 'renderHierarchyTree' function to render the child items
                render_hierarchy_tree(item.childrens, body);
                // Append the body to the Collapse item
                collapseItem.append(body);
            }

            // Append the MDUI Collapse item to the parent element
            parent_element.append(collapseItem);
        })(item); // Pass the 'item' variable as an argument to the IIFE
    });
}