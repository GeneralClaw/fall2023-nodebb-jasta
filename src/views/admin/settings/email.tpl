<!-- IMPORT admin/partials/settings/header.tpl -->

<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">[[admin/settings/email:email-settings]]</div>
    <div class="col-sm-10 col-xs-12">
        <form>
            <div class="form-group">
                <label for="email:from"><strong>[[admin/settings/email:address]]</strong></label>
                <p class="help-block">
                    [[admin/settings/email:address-help]]
                </p>
                <input type="text" class="form-control input-lg" id="email:from" data-field="email:from" placeholder="info@example.org" /><br />
            </div>

            <div class="form-group">
                <label for="email:from_name"><strong>From Name</strong></label>
                <p class="help-block">
                    [[admin/settings/email:from-help]]
                </p>
                <input type="text" class="form-control input-lg" id="email:from_name" data-field="email:from_name" placeholder="NodeBB" /><br />
            </div>

            <div class="checkbox">
                <label for="requireEmailAddress" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                    <input class="mdl-switch__input" type="checkbox" id="requireEmailAddress" data-field="requireEmailAddress" name="requireEmailAddress" />
                    <span class="mdl-switch__label">[[admin/settings/email:require-email-address]]</span>
                </label>
            </div>
            <p class="help-block">[[admin/settings/email:require-email-address-warning]]</p>

            <div class="checkbox">
                <label for="sendEmailToBanned" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                    <input class="mdl-switch__input" type="checkbox" id="sendEmailToBanned" data-field="sendEmailToBanned" name="sendEmailToBanned" />
                    <span class="mdl-switch__label">[[admin/settings/email:sendEmailToBanned]]</span>
                </label>
            </div>

            <div class="checkbox">
                <label for="removeEmailNotificationImages" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                    <input class="mdl-switch__input" type="checkbox" id="removeEmailNotificationImages" data-field="removeEmailNotificationImages" name="removeEmailNotificationImages" />
                    <span class="mdl-switch__label">[[admin/settings/email:notifications.remove-images]]</span>
                </label>
            </div>
        </form>
    </div>
</div>

<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">[[admin/settings/email:confirmation-settings]]</div>
    <div class="col-sm-10 col-xs-12">
        <div class="form-group form-inline">
            <label for="emailConfirmInterval">[[admin/settings/user:email-confirm-interval]]</label>
            <input class="form-control" data-field="emailConfirmInterval" type="number" id="emailConfirmInterval" placeholder="10" />
            <label for="emailConfirmInterval">[[admin/settings/user:email-confirm-interval2]]</label>
        </div>

        <div class="form-group">
            <label for="emailConfirmExpiry">[[admin/settings/email:confirmation.expiry]]</label>
            <input class="form-control" data-field="emailConfirmExpiry" type="number" id="emailConfirmExpiry" placeholder="24" />
        </div>

        <div class="checkbox">
            <label for="sendValidationEmail" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                <input class="mdl-switch__input" type="checkbox" id="sendValidationEmail" data-field="sendValidationEmail" name="sendValidationEmail" />
                <span class="mdl-switch__label">[[admin/settings/email:send-validation-email]]</span>
            </label>
        </div>

        <div class="checkbox">
            <label for="includeUnverifiedEmails" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                <input class="mdl-switch__input" type="checkbox" id="includeUnverifiedEmails" data-field="includeUnverifiedEmails" name="includeUnverifiedEmails" />
                <span class="mdl-switch__label">[[admin/settings/email:include-unverified-emails]]</span>
            </label>
        </div>
        <p class="help-block">[[admin/settings/email:include-unverified-warning]]</p>

        <div class="checkbox">
            <label for="emailPrompt" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                <input class="mdl-switch__input" type="checkbox" id="emailPrompt" data-field="emailPrompt" name="emailPrompt" />
                <span class="mdl-switch__label">[[admin/settings/email:prompt]]</span>
            </label>
        </div>
        <p class="help-block">[[admin/settings/email:prompt-help]]</p>
    </div>
</div>

<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">[[admin/settings/email:subscriptions]]</div>
    <div class="col-sm-10 col-xs-12">
        <form>
            <div class="checkbox">
                <label for="disableEmailSubscriptions" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
                    <input class="mdl-switch__input" type="checkbox" id="disableEmailSubscriptions" data-field="disableEmailSubscriptions" name="disableEmailSubscriptions" />
                    <span class="mdl-switch__label">[[admin/settings/email:subscriptions.disable]]</span>
                </label>
            </div>

            <div class="form-group">
                <label for="digestHour"><strong>[[admin/settings/email:subscriptions.hour]]</strong></label>
                <input type="number" class="form-control input-lg" id="digestHour" data-field="digestHour" placeholder="17" min="0" max="24" />
                <p class="help-block">
                    [[admin/settings/email:subscriptions.hour-help]]
                </p>
            </div>
        </form>
    </div>
</div>

<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">[[admin/settings/email:template]]</div>
    <div class="col-sm-10 col-xs-12">
        <label for="email-editor-selector">[[admin/settings/email:template.select]]</label><br />
        <select id="email-editor-selector" class="form-control">
            <!-- BEGIN emails -->
            <option value="{emails.path}">{emails.path}</option>
            <!-- END emails -->
        </select>
        <br />
        <div id="email-editor"></div>
        <input type="hidden" id="email-editor-holder" value="" data-field="" />
        <br />
        <button class="btn btn-warning" type="button" data-action="email.revert">[[admin/settings/email:template.revert]]</button>
    </div>
</div>

<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">[[admin/settings/email:testing]]</div>
    <div class="col-sm-10 col-xs-12">
        <div class="form-group">
            <label for="test-email">[[admin/settings/email:testing.select]]</label>
            <select id="test-email" class="form-control">
                <!-- BEGIN sendable -->
                <option value="{@value}">{@value}</option>
                <!-- END sendable -->
            </select>
        </div>
        <button class="btn btn-primary" type="button" data-action="email.test">[[admin/settings/email:testing.send]]</button>
        <p class="help-block">
            [[admin/settings/email:testing.send-help]]
        </p>
    </div>
</div>

<!-- IMPORT admin/partials/settings/footer.tpl -->
