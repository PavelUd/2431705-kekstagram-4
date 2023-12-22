import { sendData } from './api.js';
import {isEscapeKey, isRightString} from './util.js';
import { showSuccessMessage, showErrorMessage } from './mesages.js';
import{renderScaleButtons, destroyScaleButtons} from './image-scale.js';
import{createEffectSlider, onEffectsFilterChange, resetFilters} from './image-effects.js';

const MAX_HASHTAG_LENGTH = 20;
const MAX_COMMENT_LENGTH = 140;
const MAX_HASHTAG_COUNT = 5;
const HASHTAG_RULE = /^#[А-яа-яA-za-zёЁ]{1,19}$/;
const ErrorMessage = {
  BAD_HASHTAG: 'Уникальные хештеги, каждый не более 20 символов, должны быть разделены пробелом',
  BAD_COMMENT: 'Комментарий не более 140 символов'
};

const uploadButton = document.querySelector('#upload-file');
const form = document.querySelector('.img-upload__form');
const overlay = document.querySelector('.img-upload__overlay');
const mainImage = overlay.querySelector('.img-upload__preview img');
const effectsPreviews = overlay.querySelectorAll('.effects__item .effects__preview');
const cancelButton = document.querySelector('#upload-cancel');
const hashtags = document.querySelector('.text__hashtags');
const comments = document.querySelector('.text__description');
const submitButton = document.querySelector('.img-upload__submit');
const effectsFilter = document.querySelector('.img-upload__effects');

const SubmitButtonText = {
  IDLE: 'Опубликовать',
  SENDING: 'Сохраняю...'
};

const isCorrectComment = (comment) => isRightString(comment, MAX_COMMENT_LENGTH);

const isCorrectHashtags = () =>{
  let isСorrectTag = true;
  const hashtagsArray = hashtags.value.split(' ').map((hashtag) => {
    hashtag = hashtag.toLowerCase();
    if(!HASHTAG_RULE.test(hashtag) || String(hashtag).length > MAX_HASHTAG_LENGTH){
      isСorrectTag = false;
    }
    return hashtag;
  });
  const uniqueTags = new Set(hashtagsArray);

  return (isСorrectTag && uniqueTags.size === hashtagsArray.length && hashtagsArray.length <= MAX_HASHTAG_COUNT) || hashtags.value === '';
};

const onFocusPreventClose = (evt) => {
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
};

const onComentsKeydown = (evt) => onFocusPreventClose(evt);
const onHashtagsKeydown = (evt) => onFocusPreventClose(evt);

const onEscapeKeydown = (evt) => {
  if(isEscapeKey(evt)){
    form.reset();
    closeOverlay();
  }
};

const onCancelButtonClick = () => {
  form.reset();
  closeOverlay();
};

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = SubmitButtonText.SENDING;
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = SubmitButtonText.IDLE;
};

const validateForm = () => {
  const pristine = new Pristine(form, {
    classTo: 'img-upload__field-wrapper',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextClass: 'img-upload__field-wrapper__error'
  });
  pristine.addValidator(hashtags, isCorrectHashtags,
    ErrorMessage.BAD_HASHTAG);
  pristine.addValidator(comments, isCorrectComment, ErrorMessage.BAD_COMMENT);

  return pristine.validate();
};


const onFormSubmit = (evt) => {
  evt.preventDefault();
  if (validateForm()) {
    blockSubmitButton();
    sendData(new FormData(evt.target))
      .then(() =>{
        showSuccessMessage();
        form.reset();
      })
      .catch(showErrorMessage)
      .finally(() => {
        unblockSubmitButton();
        closeOverlay();
      }
      );
  }
};

function closeOverlay () {
  document.body.classList.remove('modal-open');
  overlay.classList.add('hidden');
  form.removeEventListener('submit', onFormSubmit);
  comments.removeEventListener('keydown', onComentsKeydown);
  hashtags.removeEventListener('keydown', onHashtagsKeydown);
  document.removeEventListener('keydown', onEscapeKeydown);
  destroyScaleButtons();
  resetFilters();
}

const uploadFile = () => {
  const file = uploadButton.files[0];
  mainImage.src = mainImage.src = URL.createObjectURL(file);
  effectsPreviews.forEach((picture) => {
    picture.style.backgroundImage = `url('${mainImage.src}')`;
  });
};

const onUploadButtonChange = () => {
  uploadFile();
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  form.addEventListener('submit', onFormSubmit);
  renderScaleButtons();
  effectsFilter.addEventListener('change', onEffectsFilterChange);
  cancelButton.addEventListener('click', onCancelButtonClick);
  document.addEventListener('keydown', onEscapeKeydown);
  comments.addEventListener('keydown', onComentsKeydown);
  hashtags.addEventListener('keydown', onHashtagsKeydown);
};

export const renderUploadForm = () => {

  uploadButton.addEventListener('change', onUploadButtonChange);
  createEffectSlider();
};


