'use strict'

import Mutt from '../src/index'

describe('Object Field', () => {
    test('test objects serialize correctly', () => {
        const schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                email: {
                    type: 'string',
                },
            },
        }

        const options = {
            email: {
                serialize: 'trim',
            },
        }

        const field = Mutt.fields.ObjectField.new(
            'test',
            'test',
            schema,
            options
        )

        field.value = {
            name: 'Testing',
            email: ' test@example.com ',
        }

        expect(field.getSerializedValue()).toEqual({
            name: 'Testing',
            email: 'test@example.com',
        })
    })

    test('objects support anyOf syntax for child components', () => {
        const schema = {
            type: 'object',
            properties: {
                allOf: [
                    {
                        name: {
                            type: 'string',
                        },
                        other: {
                            type: 'string',
                        },
                    },
                    {
                        telephone: {
                            type: 'string',
                        },
                    },
                ],
            },
        }

        const field = Mutt.fields.ObjectField.new(
            'test',
            'test',
            schema,
            {}
        )

        // To test this, we expect that each item accepts both
        // a name and telephone
        field.value = {
            name: 'example',
            other: 'test',
            telephone: '01234567890',
        }

        const nameField = field.getFieldByPath('name')
        const otherField = field.getFieldByPath('other')
        const telField = field.getFieldByPath('telephone')

        expect(nameField.value).toEqual('example')
        expect(otherField.value).toEqual('test')
        expect(telField.value).toEqual('01234567890')
    })

    describe('Validation', () => {
        let schema

        beforeEach(() => {
            schema = {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    email: {
                        type: 'string',
                    },
                },
            }
        })

        test('ObjectField should be marked as valid if all child fields are valid', () => {
            schema.required = ['name', 'email']

            const field = Mutt.fields.ObjectField.new(
                'test',
                'test',
                schema, {}
            )

            field.value = {
                name: 'Testing',
                email: 'example@example.com',
            }

            const validateResult = field.validate()

            expect(validateResult).toBe(true)
            expect(field._errors).toEqual({})
        })

        test('ObjectField should be marked as invalid if child field is invalid', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    email: {
                        type: 'string',
                    },
                },
            }

            schema.required = ['name', 'email']

            const field = Mutt.fields.ObjectField.new(
                'test',
                'test',
                schema, {}
            )

            field.value = {
                name: 'Testing',
                email: '',
            }

            const validateResult = field.validate()

            expect(validateResult).toBe(false)
            expect(field._errors).toEqual({
                email: [
                    'This field is required.',
                ],
            })
        })
    })

    describe('Field Dependencies', () => {
        let schema;

        beforeEach(() => {
            schema = {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    email: {
                        type: 'string',
                    },
                    telephone: {
                        type: 'string',
                    },
                },
            }
        });

        describe('Depedency adding', () => {
            test('single dependency is added correctly', () => {
                schema.dependencies = {
                    name: ['email'],
                }

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {}
                )

                field.value = {
                    name: 'Testing',
                    email: ' test@example.com ',
                }

                expect(field.object.email.isDependency).toEqual(true)
                expect(field.object.name.dependencies).toEqual(['email'])
            })

            test('multiple single depedencies are added correctly', () => {
                schema.dependencies = {
                    name: ['email'],
                    telephone: ['email'],
                }

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {}
                )

                field.value = {
                    name: 'Testing',
                    email: ' test@example.com ',
                }

                expect(field.object.name.dependencies).toEqual(['email'])
                expect(field.object.email.isDependency).toEqual(true)
                expect(field.object.telephone.dependencies).toEqual(['email'])
            })

            test('multiple depedencies are added correctly', () => {
                schema.dependencies = {
                    name: ['email', 'telephone'],
                }

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {}
                )

                field.value = {
                    name: 'Testing',
                    email: ' test@example.com ',
                }

                expect(field.object.name.dependencies).toEqual(['email', 'telephone'])
                expect(field.object.email.isDependency).toEqual(true)
                expect(field.object.telephone.isDependency).toEqual(true)
            })

            test('chained depedencies are added correctly', () => {
                schema.dependencies = {
                    name: ['email'],
                    email: ['telephone'],
                }

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {}
                )

                field.value = {
                    name: 'Testing',
                    email: ' test@example.com ',
                }

                expect(field.object.name.dependencies).toEqual(['email'])
                expect(field.object.email.dependencies).toEqual(['telephone'])

                expect(field.object.email.isDependency).toEqual(true)
                expect(field.object.telephone.isDependency).toEqual(true)
            })

            xtest('circular dependency should be detected', () => {
                // TODO:
            })
        })

        describe('Validation with depedencies', () => {
            test('Dependency field should not be validated if dependent is not required and has no value', () => {
                schema.dependencies = {
                    name: ['email'],
                }

                schema.required = ['email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {},
                )

                field.value = {
                    name: '',
                    email: 'test@example.com',
                }

                const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                const validateResult = field.validate()

                expect(emailValidateSpy).not.toHaveBeenCalled()
                expect(validateResult).toBe(true)

                emailValidateSpy.mockRestore()
            })

            test('Dependency field should be validated if dependent is not required and has a value', () => {
                schema.dependencies = {
                    name: ['email'],
                }

                schema.required = ['email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {},
                )

                field.value = {
                    name: 'Test',
                    email: 'test@example.com',
                }

                const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                const validateResult = field.validate()

                expect(emailValidateSpy).toHaveBeenCalled()
                expect(validateResult).toBe(true)

                emailValidateSpy.mockRestore()
            })

            test('dependency field should be validated when dependent is required and is validated', () => {
                schema.dependencies = {
                    name: ['email'],
                }

                schema.required = ['name', 'email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {},
                )

                field.value = {
                    name: 'Testing',
                    email: 'email@example.com',
                }

                const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                const validateResult = field.validate()

                expect(emailValidateSpy).toHaveBeenCalled()
                expect(validateResult).toBe(true)

                emailValidateSpy.mockRestore()
            })

            test('when dependency field invalid, dependent should be invalid', () => {
                schema.dependencies = {
                    name: ['email'],
                }

                schema.required = ['name', 'email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {},
                )

                field.value = {
                    name: 'Testing',
                    email: '',
                }

                const nameValidateSpy = jest.spyOn(field.object.name, 'validate')

                const validateResult = field.validate()

                expect(nameValidateSpy.mock.results[0].value).toBe(false)
                expect(validateResult).toBe(false)

                nameValidateSpy.mockRestore()
            })

            test('dependent fields should be invalid when shared dependency is invalid', () => {
                schema.dependencies = {
                    name: ['email'],
                    telephone: ['email'],
                }

                schema.required = ['name', 'telephone', 'email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {},
                )

                field.value = {
                    name: 'Testing',
                    email: '',
                    telephone: '01234567890',
                }

                const nameValidateSpy = jest.spyOn(field.object.name, 'validate')
                const telephoneValidateSpy = jest.spyOn(field.object.telephone, 'validate')

                const validateResult = field.validate()

                expect(nameValidateSpy.mock.results[0].value).toBe(false)
                expect(telephoneValidateSpy.mock.results[0].value).toBe(false)
                expect(validateResult).toBe(false)

                nameValidateSpy.mockRestore()
                telephoneValidateSpy.mockRestore()
            })

            test('when one depedency field in chain of dependencies is invalid, all parents should be invalid', () => {
                schema.dependencies = {
                    name: ['email'],
                    email: ['telephone'],
                }

                schema.required = ['name', 'telephone', 'email']

                const field = Mutt.fields.ObjectField.new(
                    'test',
                    'test',
                    schema, {}
                )

                field.value = {
                    name: 'Testing',
                    email: ' test@example.com ',
                    telephone: '',
                }

                const nameValidateSpy = jest.spyOn(field.object.name, 'validate')
                const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                const telephoneValidateSpy = jest.spyOn(field.object.telephone, 'validate')

                const validateResult = field.validate()

                expect(nameValidateSpy.mock.results[0].value).toBe(false)
                expect(emailValidateSpy.mock.results[0].value).toBe(false)
                expect(telephoneValidateSpy.mock.results[0].value).toBe(false)
                expect(validateResult).toBe(false)

                nameValidateSpy.mockRestore()
                emailValidateSpy.mockRestore()
                telephoneValidateSpy.mockRestore()
            })

            xtest('when checkbox checked, dependency fields should be validated', () => {
                // TODO:
            })

            xtest('when checkbox unchecked, dependency fields should not be validated', () => {
                // TODO:
            })

            xtest('when radio checked, dependency fields should be validated', () => {
                // TODO:
            })

            xtest('when radio unchecked, dependency fields should not be validated', () => {
                // TODO:
            })
        })
    })
})
