'use strict'

// TODO: Update tests to render form in page to correctly test DOM output

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

            test('dependent fields should have validator injected', () => {
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

                expect(field.object.email.validators.length > 0).toBe(true)
                expect(field.object.telephone.validators.length > 0).toBe(true)
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

                schema.required = ['name']

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

                schema.required = ['name']

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

                schema.required = ['name', 'telephone']

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

                schema.required = ['name']

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

            describe('boolean field validation', () => {
                test('when boolean field true, dependency fields should be validated', () => {
                    schema.properties.toggle = {
                        type: 'boolean',
                    }

                    schema.dependencies = {
                        toggle: ['email'],
                    }

                    const field = Mutt.fields.ObjectField.new(
                        'test',
                        'test',
                        schema, {},
                    )

                    field.value = {
                        toggle: true,
                        email: 'email@example.com',
                    }

                    const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                    const validateResult = field.validate()

                    expect(emailValidateSpy).toHaveBeenCalled()
                    expect(validateResult).toBe(true)

                    emailValidateSpy.mockRestore()
                })

                test('when boolean field false, dependency fields should not be validated', () => {
                    schema.properties.toggle = {
                        type: 'boolean',
                    }

                    schema.dependencies = {
                        toggle: ['email'],
                    }

                    schema.required = ['email']

                    const field = Mutt.fields.ObjectField.new(
                        'test',
                        'test',
                        schema, {},
                    )

                    field.value = {
                        toggle: false,
                        email: 'email@example.com',
                    }

                    const emailValidateSpy = jest.spyOn(field.object.email, 'validate')
                    const validateResult = field.validate()

                    expect(emailValidateSpy).not.toHaveBeenCalled()
                    expect(validateResult).toBe(true)

                    emailValidateSpy.mockRestore()
                })
            })

            describe('choice field validation', () => {
                beforeEach(() => {
                    schema = {
                        'type': 'object',
                        'properties': {
                            'choice': {
                                'type': 'string',
                                'enum': [
                                    'CHOICE_1',
                                    'CHOICE_2',
                                ],
                            },
                            'choice_1_depedency_field': {
                                'type': 'string',
                            },
                            'choice_2_depedency_field': {
                                'type': 'string',
                            },
                            'choice_3_depedency_field': {
                                'type': 'string',
                            },
                        },
                        'required': [
                            'choice',
                        ],
                    }
                });


                describe('oneOf options', () => {
                    beforeEach(() => {
                        schema.dependencies = {
                            'choice': {
                                'oneOf': [{
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_1',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_1_depedency_field',
                                    ],
                                },
                                {
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_1',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_2_depedency_field',
                                    ],
                                },
                                {
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_2',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_2_depedency_field',
                                    ],
                                },
                                ],
                            },
                        }
                    });

                    test('validation should return true when one set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                        }

                        let validateResult = field.validate()
                        expect(validateResult).toBe(true)
                    })

                    test('validation should return false when more than one set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                            choice_2_depedency_field: 'Test',
                        }

                        let validateResult = field.validate()

                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match one schema in "oneOf"']})
                    })

                    test('validation should return false when one set of dependencies is invalid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )


                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: '', // invalid value for required field
                        }

                        let validateResult = field.validate()

                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match one schema in "oneOf"']})
                    })
                })

                describe('anyOf options', () => {
                    beforeEach(() => {
                        schema.dependencies = {
                            'choice': {
                                'anyOf': [{
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_1',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_1_depedency_field',
                                    ],
                                },
                                {
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_1',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_2_depedency_field',
                                    ],
                                },
                                {
                                    'properties': {
                                        'choice': {
                                            'enum': [
                                                'CHOICE_2',
                                            ],
                                        },
                                    },
                                    'required': [
                                        'choice_2_depedency_field',
                                    ],
                                },
                                ],
                            },
                        }
                    });

                    test('validation should return true when one set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                        }

                        let validateResult = field.validate()
                        expect(validateResult).toBe(true)
                    })

                    test('validation should return true when more than one set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                            choice_2_depedency_field: 'Test',
                        }

                        let validateResult = field.validate()
                        expect(validateResult).toBe(true)
                    })

                    test('validation should return false when no set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: '',
                            choice_2_depedency_field: '',
                        }

                        let validateResult = field.validate()
                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match at least one schema in "anyOf"']})
                    })
                })

                describe('allOf options', () => {
                    beforeEach(() => {
                        schema.dependencies = {
                            'choice': {
                                'allOf': [
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_1_depedency_field',
                                        ],
                                    },
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_2_depedency_field',
                                        ],
                                    },

                                ],
                            },
                        }
                    });

                    test('validation should return true when all set of dependencies are valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                            choice_2_depedency_field: 'Test',
                            choice_2_depedency_field: 'Test',
                        }

                        let validateResult = field.validate()

                        expect(validateResult).toBe(true)
                    })

                    test('validation should return false when one set of dependencies is invalid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                            choice_2_depedency_field: '',
                        }

                        let validateResult = field.validate()
                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match all schema in "allOf"']})
                    })

                    test('validation should return false when value does not match all constants', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: 'Test',
                        }

                        schema.dependencies.choice.allOf.push({
                            'properties': {
                                'choice': {
                                    'enum': [
                                        'CHOICE_2',
                                    ],
                                },
                            },
                            'required': [
                                'choice_1_depedency_field',
                            ],
                        }, )

                        let validateResult = field.validate()

                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match all schema in "allOf"']})
                    })

                    test('validation should return false when no set of dependencies is valid', () => {
                        const field = Mutt.fields.ObjectField.new(
                            'test',
                            'test',
                            schema, {},
                        )

                        // Set field values so that 2 validate dependencies are met
                        field.value = {
                            choice: 'CHOICE_1',
                            choice_1_depedency_field: '',
                            choice_2_depedency_field: '',
                        }

                        let validateResult = field.validate()

                        expect(validateResult).toBe(false)
                        expect(field.errors).toEqual({'choice': ['Data should match all schema in "allOf"']})
                    })
                })

                // TODO:
                describe('combinations of options', () => {
                    beforeEach(() => {
                        schema.dependencies = {
                            'choice': {
                                'allOf': [
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_1_depedency_field',
                                        ],
                                    },
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_2_depedency_field',
                                        ],
                                    },
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_2',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_2_depedency_field',
                                        ],
                                    },
                                ],
                                'anyOf': [
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_1_depedency_field',
                                        ],
                                    },
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_1',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_2_depedency_field',
                                        ],
                                    },
                                    {
                                        'properties': {
                                            'choice': {
                                                'enum': [
                                                    'CHOICE_2',
                                                ],
                                            },
                                        },
                                        'required': [
                                            'choice_2_depedency_field',
                                        ],
                                    },
                                ],
                            },
                        }
                    });
                })
            })

            // TODO: remove this test once validate
            describe('Policy Example', () => {
                beforeEach(()=> {
                    schema = require('./fixtures/schema.json')
                })

                test('should be invalid as vet is required', ()=> {
                    const form = new Mutt(schema)

                    form.render(document.querySelector('body'));

                    // set the vet_registered to be true
                    document.querySelector('[name=vet_registered]').click()

                    let validateResult = form.validate()

                    expect(document.getElementById('insured_entities_1_vet_name').classList.contains('mutt-error-wrapper')).toBe(true)
                    expect(validateResult).toBe(false)
                    expect(form.getFieldByPath('insured_entities.0.vet_registered').errors).toEqual(['Data should match one schema in "oneOf"'])

                    // set the value of a required dependent field
                    document.querySelector('[name=vet_name]').value = 'test'

                    validateResult = form.validate()

                    // check the previously applied error has been removed
                    expect(document.getElementById('insured_entities_1_vet_name').classList.contains('mutt-error-wrapper')).toBe(false)
                })
            })
        })
    })
})
